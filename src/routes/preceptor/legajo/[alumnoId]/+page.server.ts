import { redirect, error } from '@sveltejs/kit';
import { obtenerLegajoAlumno } from '$lib/server/services/legajo.js';
import { obtenerHistorialAgrupamientosDeAlumno } from '$lib/server/services/agrupamientos.js';
import { alcancePreceptoria, esDirectivoOAdmin } from '$lib/server/services/authz.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  const alumnoMoodleId = Number(params.alumnoId);
  if (!Number.isSafeInteger(alumnoMoodleId) || alumnoMoodleId <= 0) error(400, 'ID inválido');

  const usuarioId = locals.usuario.usuarioId;
  const [verTodas, cursosPermitidos] = await Promise.all([esDirectivoOAdmin(usuarioId), alcancePreceptoria(usuarioId)]);
  if (cursosPermitidos) {
    const curso = Number(url.searchParams.get('curso'));
    const aConsultar = curso ? cursosPermitidos.filter((id) => id === curso) : cursosPermitidos;
    if (!aConsultar.length) error(403, 'No tenés acceso a este legajo.');
    const padrones = await Promise.allSettled(aConsultar.map(listarAlumnosDeCurso));
    if (!padrones.some((r) => r.status === 'fulfilled' && r.value.some((a) => a.id === alumnoMoodleId))) {
      if (padrones.some((r) => r.status === 'rejected')) error(503, 'No se pudo verificar la matrícula en Moodle.');
      error(403, 'No tenés acceso a este legajo.');
    }
  }
  const [legajo, agrupamientos] = await Promise.all([
    obtenerLegajoAlumno(alumnoMoodleId, { usuarioId, verTodas, cursosPermitidos }),
    obtenerHistorialAgrupamientosDeAlumno(alumnoMoodleId, cursosPermitidos).catch(() => [])
  ]);
  return { legajo, agrupamientos };
};
