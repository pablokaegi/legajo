import { redirect, error, fail } from '@sveltejs/kit';
import {
  obtenerSesion,
  listarVotos,
  listarGrupos,
  guardarGrupos,
  eliminarGrupos
} from '$lib/server/services/agrupamientos.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { obtenerConducta, obtenerNotasMoodle } from '$lib/server/services/perfilAlumnos.js';
import { generarEmparejamientos } from '$lib/server/agrupamientos/emparejar.js';
import { generarGruposEquilibrados } from '$lib/server/agrupamientos/gruposTrabajo.js';
import type { AlumnoRef } from '$lib/server/agrupamientos/tipos.js';
import type { PageServerLoad, Actions } from './$types';

/** Distribuye una lista ya ordenada en grupos heterogéneos (recorrido en serpiente). */
function serpentina<T>(ordenados: T[], tamano: number): T[][] {
  const num = Math.max(1, Math.ceil(ordenados.length / tamano));
  const grupos: T[][] = Array.from({ length: num }, () => []);
  let g = 0;
  let dir = 1;
  for (const item of ordenados) {
    grupos[g].push(item);
    g += dir;
    if (g >= num) { g = num - 1; dir = -1; }
    else if (g < 0) { g = 0; dir = 1; }
  }
  return grupos.filter((x) => x.length > 0);
}

export const load: PageServerLoad = async ({ locals, params, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const id = parseInt(params.id, 10);
  if (isNaN(id)) error(400, 'ID inválido');

  const sesion = await obtenerSesion(id);
  if (!sesion) error(404, 'Sesión no encontrada');

  const roster: AlumnoRef[] = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => []))
    .map((u) => ({ id: u.id, nombre: u.fullname }));
  const votos = await listarVotos(id);

  const tamRaw = parseInt(url.searchParams.get('tamano') ?? '4', 10);
  const tamano = isNaN(tamRaw) ? 4 : Math.max(2, Math.min(6, tamRaw));

  const afinidad = generarEmparejamientos(votos, roster);
  const heterogeneo = generarGruposEquilibrados(votos, roster, { tamano });
  const guardados = await listarGrupos(id);

  // Modo rendimiento: se calcula sólo cuando se pide (consulta notas de Moodle).
  let rendimiento: {
    grupos: { id: number; nombre: string; nota: number | null }[][];
    sinNota: number;
  } | null = null;

  if (url.searchParams.get('rendimiento') === '1') {
    const ids = roster.map((a) => a.id);
    const notas = await obtenerNotasMoodle(sesion.cursoMoodleId, ids);
    const conNota = roster.map((a) => ({ id: a.id, nombre: a.nombre, nota: notas.get(a.id) ?? null }));
    // Ordenar por nota desc (los sin nota van al final) y repartir heterogéneo
    const ordenados = [...conNota].sort((a, b) => (b.nota ?? -1) - (a.nota ?? -1));
    rendimiento = {
      grupos: serpentina(ordenados, tamano),
      sinNota: conNota.filter((a) => a.nota == null).length
    };
  }

  // Conducta (datos de legajo, consulta local rápida) — para el perfil del curso.
  const conductaMap = await obtenerConducta(roster.map((a) => a.id));
  const conducta = roster.map((a) => ({ ...a, ...conductaMap.get(a.id)! }));

  return { sesion, roster, totalVotos: votos.length, tamano, afinidad, heterogeneo, rendimiento, conducta, guardados };
};

export const actions: Actions = {
  guardar: async ({ request, locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const id = parseInt(params.id, 10);
    const fd = await request.formData();
    const nombre = (fd.get('nombre') as string)?.trim() || 'Agrupación';
    const modo = (fd.get('modo') as string) || 'afinidad';
    let grupos: AlumnoRef[][] = [];
    try {
      const parsed = JSON.parse((fd.get('gruposJson') as string) ?? '[]');
      if (Array.isArray(parsed)) {
        grupos = parsed
          .map((g: { id: unknown; nombre: unknown }[]) =>
            g.map((m) => ({ id: Number(m.id), nombre: String(m.nombre ?? '') }))
          )
          .filter((g) => g.length > 0);
      }
    } catch {
      return fail(400, { error: 'Datos de agrupación inválidos.' });
    }
    if (grupos.length === 0) return fail(400, { error: 'No hay grupos para guardar.' });
    await guardarGrupos(id, nombre, modo, grupos);
    return { ok: true };
  },

  eliminar: async ({ request, locals }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const fd = await request.formData();
    const grupoId = parseInt(fd.get('grupoId')?.toString() ?? '0', 10);
    if (grupoId) await eliminarGrupos(grupoId);
    return { ok: true };
  }
};
