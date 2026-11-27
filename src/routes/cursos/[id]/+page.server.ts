import { error, redirect } from '@sveltejs/kit';
import { listarAlumnosDeCurso, listarCursos } from '$lib/server/services/cursos.js';
import { toMoodleErrorMessage } from '$lib/server/moodle/errors.js';
import { alcancePreceptoria, puedeVerCurso } from '$lib/server/services/authz.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  const cursoId = Number(params.id);
  if (!Number.isSafeInteger(cursoId) || cursoId <= 0) error(400, 'ID de curso inválido');

  if (!(await puedeVerCurso(locals.usuario.usuarioId, cursoId))) {
    error(403, 'No tenes permiso para ver este curso');
  }

  const preceptoria = await alcancePreceptoria(locals.usuario.usuarioId);
  const puedePreceptoria = preceptoria === null || preceptoria.includes(cursoId);
  const puedeReincorporar = preceptoria === null;
  let cursoNombre = `Curso ${cursoId}`;

  try {
    const [alumnos, cursos] = await Promise.all([
      listarAlumnosDeCurso(cursoId),
      listarCursos().catch(() => [])
    ]);
    const curso = cursos.find((c) => c.id === cursoId);
    if (curso) cursoNombre = curso.displayname || curso.fullname;
    return { alumnos, cursoId, cursoNombre, puedePreceptoria, puedeReincorporar, error: null };
  } catch (err) {
    return { alumnos: [], cursoId, cursoNombre, puedePreceptoria, puedeReincorporar, error: toMoodleErrorMessage(err) };
  }
};
