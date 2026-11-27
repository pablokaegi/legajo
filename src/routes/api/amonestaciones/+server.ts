import { json } from '@sveltejs/kit';
import {
  crearAmonestacion,
  listarAmonestaciones,
  NuevaAmonestacionSchema
} from '$lib/server/services/amonestaciones.js';
import { alcanceCursos, alcancePreceptoria, puedeGestionarAmonestaciones, puedeVerAmonestaciones } from '$lib/server/services/authz.js';
import { verificarAlumnosDelCurso } from '$lib/server/services/cursos.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.usuario) return json({ error: 'No autorizado' }, { status: 401 });
  if (!(await puedeVerAmonestaciones(locals.usuario.usuarioId))) {
    return json({ error: 'Sin permiso' }, { status: 403 });
  }

  const alumno = url.searchParams.get('alumno') ? Number(url.searchParams.get('alumno')) : undefined;
  const gravedad = url.searchParams.get('gravedad') ?? undefined;
  const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1;

  const cursosPermitidos = await alcanceCursos(locals.usuario.usuarioId);
  const rows = await listarAmonestaciones({ alumnoMoodleId: alumno, gravedad, cursosPermitidos, page });
  return json(rows);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.usuario) return json({ error: 'No autorizado' }, { status: 401 });
  if (!(await puedeGestionarAmonestaciones(locals.usuario.usuarioId))) {
    return json({ error: 'Solo preceptores y directivos pueden registrar amonestaciones' }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return json({ error: 'JSON inválido' }, { status: 400 }); }

  const parsed = NuevaAmonestacionSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 422 });
  }

  const { cursoMoodleId, alumnoMoodleId } = parsed.data;
  const cursos = await alcancePreceptoria(locals.usuario.usuarioId);
  if (cursos && (!cursoMoodleId || !cursos.includes(cursoMoodleId))) {
    return json({ error: 'Elegí un curso asignado a tu rol de preceptoría.' }, { status: 403 });
  }
  if (cursoMoodleId) {
    let padron;
    try {
      padron = await verificarAlumnosDelCurso(cursoMoodleId, [alumnoMoodleId]);
    } catch {
      return json({ error: 'No se pudo verificar la matrícula en Moodle.' }, { status: 503 });
    }
    if (!padron) return json({ error: 'El alumno no pertenece al curso.' }, { status: 400 });
    parsed.data.cursoNombre = padron.cursoNombre;
    parsed.data.alumnoNombre = padron.alumnos[0].alumnoNombre;
  }
  const id = await crearAmonestacion(locals.usuario.usuarioId, parsed.data);

  await registrarAccion({
    usuarioId: locals.usuario.usuarioId,
    accion: 'crear_amonestacion',
    tablaDestino: 'amonestaciones',
    idDestino: id,
    payload: { gravedad: parsed.data.gravedad, alumno: parsed.data.alumnoMoodleId },
    ip: ipDe(request)
  });

  return json({ id }, { status: 201 });
};
