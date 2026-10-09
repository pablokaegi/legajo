import { fail } from '@sveltejs/kit';
import {
  listarVotos,
  listarGrupos,
  guardarGrupos,
  eliminarGrupos,
  puedeGestionarSesion,
  modoDe
} from '$lib/server/services/agrupamientos.js';
import { exigirSesion } from '$lib/server/agrupamientos/acceso.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { obtenerConducta, obtenerNotasMoodle } from '$lib/server/services/perfilAlumnos.js';
import { generarEmparejamientos } from '$lib/server/agrupamientos/emparejar.js';
import { generarGruposEquilibrados } from '$lib/server/agrupamientos/gruposTrabajo.js';
import {
  construirGrafo,
  agruparAlAzar,
  distribuirSerpentina,
  mejorarConApoyo
} from '$lib/server/agrupamientos/grafo.js';
import type { AlumnoRef } from '$lib/server/agrupamientos/tipos.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
  const { sesion, usuarioId } = await exigirSesion(locals.usuario, params.id, 'ver');
  const id = sesion.id;
  const puedeGestionar = await puedeGestionarSesion(usuarioId, sesion);
  const modo = modoDe(sesion);

  const roster: AlumnoRef[] = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => []))
    .map((u) => ({ id: u.id, nombre: u.fullname }));
  const votos = await listarVotos(id);
  const grafo = construirGrafo(votos, roster, modo);

  const tamRaw = parseInt(url.searchParams.get('tamano') ?? '4', 10);
  const tamano = isNaN(tamRaw) ? 4 : Math.max(2, Math.min(6, tamRaw));
  const semRaw = parseInt(url.searchParams.get('semilla') ?? '', 10);
  const semilla = isNaN(semRaw) ? id : semRaw;

  const afinidad = generarEmparejamientos(grafo, { tamano });
  const heterogeneo = generarGruposEquilibrados(grafo, { tamano });
  const aleatorio = agruparAlAzar(grafo, tamano, semilla);
  const guardados = await listarGrupos(id);

  // Modo rendimiento: se calcula sólo cuando se pide (consulta notas de Moodle).
  let rendimiento: {
    grupos: { id: number; nombre: string; nota: number | null }[][];
    sinNota: number;
  } | null = null;

  if (url.searchParams.get('rendimiento') === '1') {
    const alumnos = grafo.alumnos;
    const notas = await obtenerNotasMoodle(sesion.cursoMoodleId, alumnos.map((a) => a.id));
    const conNota = alumnos.map((a) => ({ id: a.id, nombre: a.nombre, nota: notas.get(a.id) ?? null }));
    // Ordenar por nota desc (los sin nota al final), repartir en serpiente sin
    // juntar bloqueos, y ajustar dentro de cada franja de nota para que nadie
    // quede sin ningún vínculo en su grupo.
    const ordenados = [...conNota].sort((a, b) => (b.nota ?? -1) - (a.nota ?? -1) || a.id - b.id);
    const conN = ordenados.filter((a) => a.nota != null).length;
    const franja = new Map<number, string>();
    ordenados.forEach((a, i) => {
      franja.set(a.id, a.nota == null ? 'sin' : String(Math.floor((i * 3) / Math.max(1, conN))));
    });
    const repartidos = distribuirSerpentina(ordenados, tamano, grafo.bloqueado);
    rendimiento = {
      grupos: mejorarConApoyo(repartidos, (aid) => franja.get(aid) ?? 'sin', grafo),
      sinNota: conNota.filter((a) => a.nota == null).length
    };
  }

  // Conducta (datos de legajo, consulta local rápida) — para el perfil del curso.
  const conductaMap = await obtenerConducta(roster.map((a) => a.id));
  const conducta = roster.map((a) => ({ ...a, ...conductaMap.get(a.id)! }));

  return {
    sesion, roster, modo, totalVotos: votos.length, tamano, semilla,
    afinidad, heterogeneo, aleatorio, rendimiento, conducta, guardados, puedeGestionar,
    bloqueos: grafo.paresBloqueados.length
  };
};

const MODOS = new Set(['afinidad', 'rendimiento', 'heterogeneo', 'aleatorio', 'manual']);

export const actions: Actions = {
  guardar: async ({ request, locals, params }) => {
    const { sesion } = await exigirSesion(locals.usuario, params.id, 'gestionar');
    const fd = await request.formData();
    const nombre = ((fd.get('nombre') as string)?.trim() || 'Agrupación').slice(0, 200);
    const modoRaw = (fd.get('modo') as string) || 'afinidad';
    const modo = MODOS.has(modoRaw) ? modoRaw : 'manual';

    // Solo alumnos del curso, cada uno una vez, con el nombre del padrón.
    const roster: AlumnoRef[] = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => []))
      .map((u) => ({ id: u.id, nombre: u.fullname }));
    if (roster.length === 0) return fail(503, { error: 'No se pudo obtener la lista del curso.' });
    const porId = new Map(roster.map((a) => [a.id, a]));

    let grupos: AlumnoRef[][] = [];
    try {
      const parsed = JSON.parse((fd.get('gruposJson') as string) ?? '[]');
      if (!Array.isArray(parsed)) return fail(400, { error: 'Datos de agrupación inválidos.' });
      const usados = new Set<number>();
      for (const g of parsed) {
        if (!Array.isArray(g)) continue;
        const miembros: AlumnoRef[] = [];
        for (const m of g as { id?: unknown }[]) {
          const a = porId.get(Number(m?.id));
          if (!a || usados.has(a.id)) continue;
          usados.add(a.id);
          miembros.push(a);
        }
        if (miembros.length > 0) grupos.push(miembros);
      }
    } catch {
      return fail(400, { error: 'Datos de agrupación inválidos.' });
    }
    if (grupos.length === 0) return fail(400, { error: 'No hay grupos para guardar.' });
    await guardarGrupos(sesion.id, nombre, modo, grupos);
    return { ok: true };
  },

  eliminar: async ({ request, locals, params }) => {
    const { sesion } = await exigirSesion(locals.usuario, params.id, 'gestionar');
    const fd = await request.formData();
    const grupoId = parseInt(fd.get('grupoId')?.toString() ?? '0', 10);
    if (grupoId) await eliminarGrupos(sesion.id, grupoId);
    return { ok: true };
  }
};
