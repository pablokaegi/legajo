import { error, redirect } from '@sveltejs/kit';
import { moodle } from '$lib/server/moodle/client.js';
import { toMoodleErrorMessage } from '$lib/server/moodle/errors.js';
import { puedeVerAlumno } from '$lib/server/services/authz.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  const courseId = parseInt(params.id, 10);
  const userId = parseInt(params.alumnoId, 10);

  if (isNaN(courseId) || isNaN(userId)) error(400, 'IDs invalidos');

  if (!(await puedeVerAlumno(locals.usuario.usuarioId, userId))) {
    error(403, 'No tenes permiso para ver este alumno');
  }

  const alumnoNombre = url.searchParams.get('nombre') ?? 'Alumno';
  const cursoNombre = url.searchParams.get('curso') ?? '';

  try {
    const grades = await moodle.getGradeItems(courseId, userId);
    return { grades, courseId, userId, alumnoNombre, cursoNombre, error: null };
  } catch (err) {
    return {
      grades: null, courseId, userId, alumnoNombre, cursoNombre,
      error: toMoodleErrorMessage(err)
    };
  }
};
