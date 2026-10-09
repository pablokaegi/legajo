import { listarVotos, modoDe } from '$lib/server/services/agrupamientos.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { obtenerConducta } from '$lib/server/services/perfilAlumnos.js';
import { calcularEstadisticas } from '$lib/server/agrupamientos/estadisticas.js';
import { analizarRelacionesSociales } from '$lib/server/agrupamientos/analizar.js';
import { construirGrafo } from '$lib/server/agrupamientos/grafo.js';
import { exigirSesion } from '$lib/server/agrupamientos/acceso.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const { sesion } = await exigirSesion(locals.usuario, params.id, 'ver');

  const roster = await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => []);
  const votos = await listarVotos(sesion.id);
  const grafo = construirGrafo(
    votos,
    roster.map((u) => ({ id: u.id, nombre: u.fullname })),
    modoDe(sesion)
  );

  const stats = calcularEstadisticas(grafo, votos);
  const analisis = analizarRelacionesSociales(grafo);

  // Conducta (datos de legajo) — consulta local rápida.
  const conductaMap = await obtenerConducta(roster.map((u) => u.id));
  const conducta = roster
    .map((u) => ({ id: u.id, nombre: u.fullname, ...conductaMap.get(u.id)! }))
    .filter((c) => c.observacionesCount > 0 || c.faltas > 0 || c.amonestaciones > 0);

  return { sesion, stats, analisis, conducta };
};
