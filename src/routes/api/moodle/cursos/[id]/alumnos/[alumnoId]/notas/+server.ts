import { json } from '@sveltejs/kit';
import { moodle } from '$lib/server/moodle/client.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { toMoodleErrorMessage } from '$lib/server/moodle/errors.js';
import { puedeVerNotasCurso } from '$lib/server/services/authz.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.usuario) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }

  const courseId = Number(params.id);
  const userId = Number(params.alumnoId);

  if (![courseId, userId].every((id) => Number.isSafeInteger(id) && id > 0)) {
    return json({ error: 'IDs invalidos' }, { status: 400 });
  }

  if (!(await puedeVerNotasCurso(locals.usuario.usuarioId, courseId, userId))) {
    return json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const alumnos = await listarAlumnosDeCurso(courseId);
    if (!alumnos.some((a) => a.id === userId)) {
      return json({ error: 'El alumno no pertenece al curso.' }, { status: 404 });
    }
    const grades = await moodle.getGradeItems(courseId, userId);
    return json(grades);
  } catch (err) {
    return json({ error: toMoodleErrorMessage(err) }, { status: 503 });
  }
};
