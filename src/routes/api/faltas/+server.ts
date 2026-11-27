import { json } from '@sveltejs/kit';
import { crearFalta, listarFaltas, NuevaFaltaSchema } from '$lib/server/services/faltas.js';
import { alcanceCursos, puedeGestionarPreceptoriaCurso, puedeVerFaltas } from '$lib/server/services/authz.js';
import { verificarAlumnosDelCurso } from '$lib/server/services/cursos.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.usuario) return json({ error: 'No autorizado' }, { status: 401 });
  if (!(await puedeVerFaltas(locals.usuario.usuarioId))) {
    return json({ error: 'Sin permiso' }, { status: 403 });
  }

  const curso = url.searchParams.get('curso') ? Number(url.searchParams.get('curso')) : undefined;
  const alumno = url.searchParams.get('alumno') ? Number(url.searchParams.get('alumno')) : undefined;
  const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1;

  const cursosPermitidos = await alcanceCursos(locals.usuario.usuarioId);
  const rows = await listarFaltas({ cursoMoodleId: curso, alumnoMoodleId: alumno, cursosPermitidos, page });
  return json(rows);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.usuario) return json({ error: 'No autorizado' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return json({ error: 'JSON inválido' }, { status: 400 }); }

  const parsed = NuevaFaltaSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 422 });
  }

  const { cursoMoodleId, alumnos } = parsed.data;
  if (!(await puedeGestionarPreceptoriaCurso(locals.usuario.usuarioId, cursoMoodleId))) {
    return json({ error: 'No tenés permisos de preceptoría para este curso.' }, { status: 403 });
  }
  let padron;
  try {
    padron = await verificarAlumnosDelCurso(cursoMoodleId, alumnos.map((a) => a.alumnoMoodleId));
  } catch {
    return json({ error: 'No se pudo verificar la matrícula en Moodle.' }, { status: 503 });
  }
  if (!padron) return json({ error: 'Algún alumno no pertenece al curso.' }, { status: 400 });
  const notas = new Map(alumnos.map((a) => [a.alumnoMoodleId, a.nota]));
  const id = await crearFalta(locals.usuario.usuarioId, {
    ...parsed.data,
    cursoNombre: padron.cursoNombre,
    alumnos: padron.alumnos.map((a) => ({ ...a, nota: notas.get(a.alumnoMoodleId) }))
  });

  await registrarAccion({
    usuarioId: locals.usuario.usuarioId,
    accion: 'crear_falta',
    tablaDestino: 'faltas',
    idDestino: id,
    payload: { tipo: parsed.data.tipo, alumnos: parsed.data.alumnos.length },
    ip: ipDe(request)
  });

  return json({ id }, { status: 201 });
};
