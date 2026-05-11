import { listarCursos } from '$lib/server/services/cursos.js';
import { toMoodleErrorMessage } from '$lib/server/moodle/errors.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const cursos = await listarCursos();
    return { cursos, error: null };
  } catch (err) {
    return { cursos: [], error: toMoodleErrorMessage(err) };
  }
};
