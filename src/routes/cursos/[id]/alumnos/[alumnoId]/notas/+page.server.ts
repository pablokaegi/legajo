import { error, redirect } from '@sveltejs/kit';
import { moodle } from '$lib/server/moodle/client.js';
import { listarAlumnosDeCurso, listarCursos } from '$lib/server/services/cursos.js';
import { toMoodleErrorMessage } from '$lib/server/moodle/errors.js';
import { puedeVerNotasCurso } from '$lib/server/services/authz.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  const courseId = Number(params.id);
  const userId = Number(params.alumnoId);

  if (![courseId, userId].every((id) => Number.isSafeInteger(id) && id > 0)) error(400, 'IDs inválidos');

  if (!(await puedeVerNotasCurso(locals.usuario.usuarioId, courseId, userId))) {
    error(403, 'No tenés permiso para ver estas notas');
  }

  const [alumnos, cursos] = await Promise.all([
    listarAlumnosDeCurso(courseId).catch(() => null),
    listarCursos().catch(() => [])
  ]);
  if (alumnos === null) error(503, 'No se pudo verificar la matrícula en Moodle.');
  const alumno = alumnos.find((a) => a.id === userId);
  if (!alumno) error(404, 'El alumno no pertenece al curso.');
  const alumnoNombre = alumno.fullname;
  const curso = cursos.find((c) => c.id === courseId);
  const cursoNombre = curso ? curso.displayname || curso.fullname : `Curso ${courseId}`;

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
