import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { toMoodleErrorMessage } from '$lib/server/moodle/errors.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const cursoId = parseInt(params.id, 10);
  if (isNaN(cursoId)) error(400, 'ID de curso inválido');

  try {
    const alumnos = await listarAlumnosDeCurso(cursoId);
    return { alumnos, cursoId, error: null };
  } catch (err) {
    return { alumnos: [], cursoId, error: toMoodleErrorMessage(err) };
  }
};
