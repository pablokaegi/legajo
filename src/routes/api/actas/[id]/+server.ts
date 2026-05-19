import { json } from '@sveltejs/kit';
import { obtenerActaCompleta, editarActa, EditarActaSchema } from '$lib/server/services/actas.js';
import { puedeVerActas, puedeEditarActa } from '$lib/server/services/authz.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.usuario) return json({ error: 'No autorizado' }, { status: 401 });
  if (!(await puedeVerActas(locals.usuario.usuarioId))) {
    return json({ error: 'Sin permiso' }, { status: 403 });
  }

  const id = parseInt(params.id, 10);
  if (isNaN(id)) return json({ error: 'ID inválido' }, { status: 400 });

  const acta = await obtenerActaCompleta(id);
  if (!acta) return json({ error: 'Acta no encontrada' }, { status: 404 });

  return json(acta);
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.usuario) return json({ error: 'No autorizado' }, { status: 401 });
  if (!(await puedeEditarActa(locals.usuario.usuarioId))) {
    return json({ error: 'Sin permiso para editar actas' }, { status: 403 });
  }

  const id = parseInt(params.id, 10);
  if (isNaN(id)) return json({ error: 'ID inválido' }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return json({ error: 'JSON inválido' }, { status: 400 }); }

  const parsed = EditarActaSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 422 });
  }

  try {
    await editarActa(id, locals.usuario.usuarioId, parsed.data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error';
    if (msg === 'Acta no encontrada') return json({ error: msg }, { status: 404 });
    throw err;
  }

  await registrarAccion({
    usuarioId: locals.usuario.usuarioId,
    accion: 'editar_acta',
    tablaDestino: 'actas',
    idDestino: id,
    ip: ipDe(request)
  });

  return json({ ok: true });
};
