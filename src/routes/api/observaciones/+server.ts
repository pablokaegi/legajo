import { json } from '@sveltejs/kit';
import { z } from 'zod';
import {
  crearObservacion,
  obtenerHistorialFiltrado,
  ObservacionSchema
} from '$lib/server/services/observaciones.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.docente) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }

  const alumno = url.searchParams.get('alumno')?.trim() || undefined;
  const curso = url.searchParams.get('curso')?.trim() || undefined;

  const obs = await obtenerHistorialFiltrado({
    docenteId: locals.docente.docenteId,
    alumno,
    curso
  });

  return json(obs);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.docente) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = ObservacionSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const id = await crearObservacion(locals.docente.docenteId, parsed.data);
  return json({ id }, { status: 201 });
};
