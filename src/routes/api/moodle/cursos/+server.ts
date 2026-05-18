import { json } from '@sveltejs/kit';
import { listarCursos } from '$lib/server/services/cursos.js';
import { toMoodleErrorMessage } from '$lib/server/moodle/errors.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.usuario) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const cursos = await listarCursos();
    return json(cursos);
  } catch (err) {
    return json({ error: toMoodleErrorMessage(err) }, { status: 503 });
  }
};
