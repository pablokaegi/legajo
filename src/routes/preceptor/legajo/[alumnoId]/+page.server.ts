import { redirect, error } from '@sveltejs/kit';
import { obtenerLegajoAlumno } from '$lib/server/services/legajo.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  const alumnoMoodleId = parseInt(params.alumnoId, 10);
  if (isNaN(alumnoMoodleId) || alumnoMoodleId <= 0) throw error(400, 'ID inválido');

  const legajo = await obtenerLegajoAlumno(alumnoMoodleId);
  return { legajo };
};
