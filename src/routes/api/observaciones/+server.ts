import { json } from '@sveltejs/kit';
import {
  crearObservacion,
  obtenerHistorialFiltrado,
  ObservacionSchema
} from '$lib/server/services/observaciones.js';
import { puedeCrearObservacion, esDirectivo } from '$lib/server/services/authz.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.usuario) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }

  const alumno = url.searchParams.get('alumno')?.trim() || undefined;
  const curso = url.searchParams.get('curso')?.trim() || undefined;

  const omitUsuarioFilter = await esDirectivo(locals.usuario.usuarioId);

  const obs = await obtenerHistorialFiltrado({
    usuarioId: locals.usuario.usuarioId,
    alumno,
    curso,
    omitUsuarioFilter
  });

  return json(obs);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.usuario) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!(await puedeCrearObservacion(locals.usuario.usuarioId))) {
    return json({ error: 'No tenes permiso para crear observaciones' }, { status: 403 });
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

  const id = await crearObservacion(locals.usuario.usuarioId, parsed.data);
  return json({ id }, { status: 201 });
};
