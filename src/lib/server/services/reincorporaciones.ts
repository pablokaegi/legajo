import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { reincorporaciones } from '../db/schema.js';

// ─── Schema ────────────────────────────────────────────────────────────────────
export const NuevaReincorporacionSchema = z.object({
  alumnoMoodleId: z.number().int().positive(),
  alumnoNombre: z.string().min(1).max(200),
  fechaReincorporacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  observaciones: z.string().max(3000).optional(),
  documentoUrl: z.string().url('URL inválida').max(500).optional(),
  linkedFaltaId: z.number().int().positive().optional()
});

export type NuevaReincorporacionInput = z.infer<typeof NuevaReincorporacionSchema>;

// ─── Servicio ─────────────────────────────────────────────────────────────────
export async function crearReincorporacion(
  preceptorId: number,
  data: NuevaReincorporacionInput
): Promise<number> {
  const [result] = await db.insert(reincorporaciones).values({
    alumnoMoodleId: data.alumnoMoodleId,
    alumnoNombre: data.alumnoNombre,
    fechaReincorporacion: data.fechaReincorporacion,
    preceptorId,
    observaciones: data.observaciones ?? null,
    documentoUrl: data.documentoUrl ?? null,
    linkedFaltaId: data.linkedFaltaId ?? null
  });
  return (result as { insertId: number }).insertId;
}

export async function listarReincorporaciones(filtros: {
  preceptorId?: number;
  alumnoMoodleId?: number;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filtros.page ?? 1);
  const limit = Math.min(100, filtros.limit ?? 20);
  const offset = (page - 1) * limit;

  let query = db
    .select()
    .from(reincorporaciones)
    .orderBy(desc(reincorporaciones.fechaReincorporacion))
    .limit(limit)
    .offset(offset);

  if (filtros.preceptorId) {
    query = query.where(eq(reincorporaciones.preceptorId, filtros.preceptorId)) as typeof query;
  } else if (filtros.alumnoMoodleId) {
    query = query.where(eq(reincorporaciones.alumnoMoodleId, filtros.alumnoMoodleId)) as typeof query;
  }

  return await query;
}
