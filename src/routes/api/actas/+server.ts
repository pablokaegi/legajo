import { json } from '@sveltejs/kit';
import { crearActa, listarActas, NuevaActaSchema } from '$lib/server/services/actas.js';
import { puedeCrearActa, puedeVerActas } from '$lib/server/services/authz.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.usuario) return json({ error: 'No autorizado' }, { status: 401 });
  if (!(await puedeVerActas(locals.usuario.usuarioId))) {
    return json({ error: 'Sin permiso' }, { status: 403 });
  }

  const estado = url.searchParams.get('estado') ?? undefined;
  const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1;
  const rows = await listarActas({ estado, page });
  return json(rows);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.usuario) return json({ error: 'No autorizado' }, { status: 401 });
  if (!(await puedeCrearActa(locals.usuario.usuarioId))) {
    return json({ error: 'Solo preceptores y directivos pueden crear actas' }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return json({ error: 'JSON inválido' }, { status: 400 }); }

  const parsed = NuevaActaSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 422 });
  }

  const id = await crearActa(locals.usuario.usuarioId, parsed.data);

  await registrarAccion({
    usuarioId: locals.usuario.usuarioId,
    accion: 'crear_acta',
    tablaDestino: 'actas',
    idDestino: id,
    payload: { titulo: parsed.data.titulo },
    ip: ipDe(request)
  });

  return json({ id }, { status: 201 });
};
