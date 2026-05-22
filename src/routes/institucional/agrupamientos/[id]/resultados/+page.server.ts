import { redirect, error, fail } from '@sveltejs/kit';
import {
  obtenerSesion,
  listarVotos,
  listarGrupos,
  guardarGrupos,
  eliminarGrupos
} from '$lib/server/services/agrupamientos.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { generarEmparejamientos } from '$lib/server/agrupamientos/emparejar.js';
import { generarGruposEquilibrados } from '$lib/server/agrupamientos/gruposTrabajo.js';
import type { AlumnoRef } from '$lib/server/agrupamientos/tipos.js';
import type { PageServerLoad, Actions } from './$types';

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

  return { sesion, roster, totalVotos: votos.length, tamano, afinidad, heterogeneo, guardados };
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
      if (Array.isArray(parsed)) grupos = parsed;
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
