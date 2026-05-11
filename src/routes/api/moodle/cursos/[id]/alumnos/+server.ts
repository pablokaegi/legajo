import { json, error } from '@sveltejs/kit';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { toMoodleErrorMessage } from '$lib/server/moodle/errors.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.docente) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }

  const cursoId = parseInt(params.id, 10);
  if (isNaN(cursoId)) {
    return json({ error: 'ID de curso inválido' }, { status: 400 });
  }

  try {
    const alumnos = await listarAlumnosDeCurso(cursoId);
    return json(alumnos);
  } catch (err) {
    return json({ error: toMoodleErrorMessage(err) }, { status: 503 });
  }
};
