import { json } from '@sveltejs/kit';
import { crearFalta, listarFaltas, NuevaFaltaSchema } from '$lib/server/services/faltas.js';
import { puedeGestionarFaltas, puedeVerFaltas } from '$lib/server/services/authz.js';
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

  const rows = await listarFaltas({ cursoMoodleId: curso, alumnoMoodleId: alumno, page });
  return json(rows);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.usuario) return json({ error: 'No autorizado' }, { status: 401 });
  if (!(await puedeGestionarFaltas(locals.usuario.usuarioId))) {
    return json({ error: 'Solo preceptores y directivos pueden registrar faltas' }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return json({ error: 'JSON inválido' }, { status: 400 }); }

  const parsed = NuevaFaltaSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 422 });
  }

  const id = await crearFalta(locals.usuario.usuarioId, parsed.data);

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
