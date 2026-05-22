import { redirect, error, fail } from '@sveltejs/kit';
import {
  obtenerSesion,
  idsQueVotaron,
  asignarCompaneros,
  procesarVotoDesdeForm
} from '$lib/server/services/agrupamientos.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import type { AlumnoRef } from '$lib/server/agrupamientos/tipos.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const id = parseInt(params.id, 10);
  if (isNaN(id)) error(400, 'ID inválido');

  const sesion = await obtenerSesion(id);
  if (!sesion) error(404, 'Sesión no encontrada');

  const roster: AlumnoRef[] = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => []))
    .map((u) => ({ id: u.id, nombre: u.fullname }));

  const yaVotaron = [...(await idsQueVotaron(id))];

  const asignaciones: Record<number, AlumnoRef[]> = {};
  for (const a of roster) {
    asignaciones[a.id] = asignarCompaneros(id, a.id, roster, sesion.cantidadEvaluar);
  }

  return { sesion, roster, yaVotaron, asignaciones };
};

export const actions: Actions = {
  votar: async ({ request, locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const id = parseInt(params.id, 10);
    const sesion = await obtenerSesion(id);
    if (!sesion) return fail(404, { error: 'Sesión no encontrada.' });
    if (sesion.estado === 'cerrada') return fail(400, { error: 'La votación está cerrada.' });

    const res = await procesarVotoDesdeForm(id, await request.formData());
    if ('error' in res) return fail(400, res);
    return { ok: true };
  }
};
