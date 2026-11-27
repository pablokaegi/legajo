import { redirect } from '@sveltejs/kit';
import { listarCursos } from '$lib/server/services/cursos.js';
import { cursosVisiblesPara } from '$lib/server/services/authz.js';
import { toMoodleErrorMessage } from '$lib/server/moodle/errors.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  try {
    const cursos = await cursosVisiblesPara(locals.usuario.usuarioId, await listarCursos());
    return { cursos, error: null };
  } catch (err) {
    return { cursos: [], error: toMoodleErrorMessage(err) };
  }
};
