import { json } from '@sveltejs/kit';
import { moodle } from '$lib/server/moodle/client.js';
import { toMoodleErrorMessage } from '$lib/server/moodle/errors.js';
import { puedeVerAlumno } from '$lib/server/services/authz.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.usuario) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }

  const courseId = parseInt(params.id, 10);
  const userId = parseInt(params.alumnoId, 10);

  if (isNaN(courseId) || isNaN(userId)) {
    return json({ error: 'IDs invalidos' }, { status: 400 });
  }

  if (!(await puedeVerAlumno(locals.usuario.usuarioId, userId))) {
    return json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const grades = await moodle.getGradeItems(courseId, userId);
    return json(grades);
  } catch (err) {
    return json({ error: toMoodleErrorMessage(err) }, { status: 503 });
  }
};
