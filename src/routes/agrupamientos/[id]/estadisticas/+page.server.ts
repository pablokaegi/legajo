import { redirect, error } from '@sveltejs/kit';
import { obtenerSesion, listarVotos } from '$lib/server/services/agrupamientos.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { obtenerConducta } from '$lib/server/services/perfilAlumnos.js';
import { calcularEstadisticas } from '$lib/server/agrupamientos/estadisticas.js';
import { analizarRelacionesSociales } from '$lib/server/agrupamientos/analizar.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const id = parseInt(params.id, 10);
  if (isNaN(id)) error(400, 'ID inválido');

  const sesion = await obtenerSesion(id);
  if (!sesion) error(404, 'Sesión no encontrada');

  const roster = await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => []);
  const votos = await listarVotos(id);

  const stats = calcularEstadisticas(votos, roster.length);
  const analisis = analizarRelacionesSociales(votos);

  // Conducta (datos de legajo) — consulta local rápida.
  const conductaMap = await obtenerConducta(roster.map((u) => u.id));
  const conducta = roster
    .map((u) => ({ id: u.id, nombre: u.fullname, ...conductaMap.get(u.id)! }))
    .filter((c) => c.observacionesCount > 0 || c.faltas > 0 || c.amonestaciones > 0);

  return { sesion, stats, analisis, conducta };
};
