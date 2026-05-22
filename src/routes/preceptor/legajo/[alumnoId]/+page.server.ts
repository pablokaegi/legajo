import { redirect, error } from '@sveltejs/kit';
import { obtenerLegajoAlumno } from '$lib/server/services/legajo.js';
import { obtenerHistorialAgrupamientosDeAlumno } from '$lib/server/services/agrupamientos.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  const alumnoMoodleId = parseInt(params.alumnoId, 10);
  if (isNaN(alumnoMoodleId) || alumnoMoodleId <= 0) throw error(400, 'ID inválido');

  const [legajo, agrupamientos] = await Promise.all([
    obtenerLegajoAlumno(alumnoMoodleId),
    obtenerHistorialAgrupamientosDeAlumno(alumnoMoodleId).catch(() => [])
  ]);
  return { legajo, agrupamientos };
};
