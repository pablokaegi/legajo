import { error, redirect } from '@sveltejs/kit';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { toMoodleErrorMessage } from '$lib/server/moodle/errors.js';
import { puedeVerCurso } from '$lib/server/services/authz.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  const cursoId = parseInt(params.id, 10);
  if (isNaN(cursoId)) error(400, 'ID de curso invalido');

  if (!(await puedeVerCurso(locals.usuario.usuarioId, cursoId))) {
    error(403, 'No tenes permiso para ver este curso');
  }

  const cursoNombre = url.searchParams.get('nombre') ?? `Curso ${cursoId}`;

  try {
    const alumnos = await listarAlumnosDeCurso(cursoId);
    return { alumnos, cursoId, cursoNombre, error: null };
  } catch (err) {
    return { alumnos: [], cursoId, cursoNombre, error: toMoodleErrorMessage(err) };
  }
};
