import { json } from '@sveltejs/kit';
import {
  crearObservacion,
  obtenerHistorialFiltrado,
  ObservacionSchema
} from '$lib/server/services/observaciones.js';
import { alcanceCursos, esDirectivo, puedeVerCurso } from '$lib/server/services/authz.js';
import { verificarAlumnosDelCurso } from '$lib/server/services/cursos.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.usuario) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }

  const alumno = url.searchParams.get('alumno')?.trim() || undefined;
  const curso = url.searchParams.get('curso')?.trim() || undefined;

  const [omitUsuarioFilter, cursosPermitidos] = await Promise.all([
    esDirectivo(locals.usuario.usuarioId),
    alcanceCursos(locals.usuario.usuarioId)
  ]);

  const obs = await obtenerHistorialFiltrado({
    usuarioId: locals.usuario.usuarioId,
    alumno,
    curso,
    omitUsuarioFilter,
    cursosPermitidos
  });

  return json(obs);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.usuario) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'JSON invalido' }, { status: 400 });
  }

  const parsed = ObservacionSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: 'Datos invalidos', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { cursoMoodleId, alumnoMoodleId } = parsed.data;
  if (!(await puedeVerCurso(locals.usuario.usuarioId, cursoMoodleId))) {
    return json({ error: 'No tenés permiso para registrar observaciones en este curso.' }, { status: 403 });
  }
  let padron;
  try {
    padron = await verificarAlumnosDelCurso(cursoMoodleId, [alumnoMoodleId]);
  } catch {
    return json({ error: 'No se pudo verificar la matrícula en Moodle.' }, { status: 503 });
  }
  if (!padron) return json({ error: 'El alumno no pertenece al curso.' }, { status: 400 });
  const id = await crearObservacion(locals.usuario.usuarioId, {
    ...parsed.data,
    cursoNombre: padron.cursoNombre,
    alumnoNombre: padron.alumnos[0].alumnoNombre
  });
  return json({ id }, { status: 201 });
};
