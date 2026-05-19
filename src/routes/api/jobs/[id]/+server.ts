import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';
import { jobs } from '$lib/server/db/schema.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.usuario) return json({ error: 'No autorizado' }, { status: 401 });

  const [job] = await db.select().from(jobs).where(eq(jobs.id, params.id)).limit(1);
  if (!job) return json({ error: 'Job no encontrado' }, { status: 404 });

  // Solo el dueño del job puede verlo (o directivos)
  if (job.usuarioId !== locals.usuario.usuarioId) {
    return json({ error: 'Sin permiso' }, { status: 403 });
  }

  return json({
    id: job.id,
    tipo: job.tipo,
    estado: job.estado,
    total: job.total,
    procesados: job.procesados,
    errores: job.errores,
    progreso: job.total > 0 ? Math.round((job.procesados / job.total) * 100) : 0,
    resultado: job.resultadoJson ? JSON.parse(job.resultadoJson) : null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt
  });
};
