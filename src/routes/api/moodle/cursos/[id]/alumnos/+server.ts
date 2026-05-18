import { json } from '@sveltejs/kit';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { toMoodleErrorMessage } from '$lib/server/moodle/errors.js';
import { puedeVerCurso } from '$lib/server/services/authz.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.usuario) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }

  const cursoId = parseInt(params.id, 10);
  if (isNaN(cursoId)) {
    return json({ error: 'ID de curso invalido' }, { status: 400 });
  }

  if (!(await puedeVerCurso(locals.usuario.usuarioId, cursoId))) {
    return json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const alumnos = await listarAlumnosDeCurso(cursoId);
    return json(alumnos);
  } catch (err) {
    return json({ error: toMoodleErrorMessage(err) }, { status: 503 });
  }
};
