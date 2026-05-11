import { moodle } from '$lib/server/moodle/client.js';
import { toMoodleErrorMessage } from '$lib/server/moodle/errors.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
  const courseId = parseInt(params.id, 10);
  const userId = parseInt(params.alumnoId, 10);

  if (isNaN(courseId) || isNaN(userId)) error(400, 'IDs inválidos');

  const alumnoNombre = url.searchParams.get('nombre') ?? 'Alumno';
  const cursoNombre = url.searchParams.get('curso') ?? '';

  try {
    const grades = await moodle.getGradeItems(courseId, userId);
    return {
      grades,
      courseId,
      userId,
      alumnoNombre,
      cursoNombre,
      error: null
    };
  } catch (err) {
    return {
      grades: null,
      courseId,
      userId,
      alumnoNombre,
      cursoNombre,
      error: toMoodleErrorMessage(err)
    };
  }
};
