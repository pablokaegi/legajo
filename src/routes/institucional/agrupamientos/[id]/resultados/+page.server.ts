import { redirect, error } from '@sveltejs/kit';
import { obtenerSesion, listarVotos } from '$lib/server/services/agrupamientos.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { generarEmparejamientos } from '$lib/server/agrupamientos/emparejar.js';
import { analizarRelacionesSociales } from '$lib/server/agrupamientos/analizar.js';
import { generarGruposEquilibrados } from '$lib/server/agrupamientos/gruposTrabajo.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const id = parseInt(params.id, 10);
  if (isNaN(id)) error(400, 'ID inválido');

  const sesion = await obtenerSesion(id);
  if (!sesion) error(404, 'Sesión no encontrada');

  const votos = await listarVotos(id);
  const roster = await listarAlumnosDeCurso(sesion.cursoMoodleId)
    .then((us) => us.map((u) => ({ id: u.id, nombre: u.fullname })))
    .catch(() => []);

  const emparejamientos = generarEmparejamientos(votos);
  const analisis = analizarRelacionesSociales(votos);
  const gruposEquilibrados = generarGruposEquilibrados(votos, roster);

  return {
    sesion,
    totalVotos: votos.length,
    emparejamientos,
    analisis,
    gruposEquilibrados
  };
};
