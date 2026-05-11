import { eq, and, desc, sql, like } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { observaciones } from '../db/schema.js';
import type { Observacion } from '../db/schema.js';

// ─── Schema de validación ─────────────────────────────────────────────────────
export const ObservacionSchema = z.object({
  alumnoMoodleId: z.number().int().positive(),
  alumnoNombre: z.string().min(1).max(200),
  cursoMoodleId: z.number().int().positive(),
  cursoNombre: z.string().min(1).max(200),
  actitud: z.number().int().min(1).max(5),
  tareaCompleta: z.boolean(),
  participacion: z.number().int().min(1).max(5),
  observacionTexto: z.string().max(500).optional().nullable(),
  fecha: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida')
});

export type ObservacionInput = z.infer<typeof ObservacionSchema>;

// ─── Crear observación ────────────────────────────────────────────────────────
export async function crearObservacion(
  docenteId: number,
  input: ObservacionInput
): Promise<number> {
  const validated = ObservacionSchema.parse(input);

  const result = await db.insert(observaciones).values({
    docenteId,
    ...validated
  });

  return Number(result[0].insertId);
}

// ─── Historial por alumno ─────────────────────────────────────────────────────
export async function obtenerHistorialAlumno(
  alumnoMoodleId: number
): Promise<Observacion[]> {
  return db
    .select()
    .from(observaciones)
    .where(eq(observaciones.alumnoMoodleId, alumnoMoodleId))
    .orderBy(desc(observaciones.fecha));
}

// ─── Historial por curso ──────────────────────────────────────────────────────
export async function obtenerHistorialCurso(
  cursoMoodleId: number
): Promise<Observacion[]> {
  return db
    .select()
    .from(observaciones)
    .where(eq(observaciones.cursoMoodleId, cursoMoodleId))
    .orderBy(desc(observaciones.fecha));
}

// ─── Historial por docente ────────────────────────────────────────────────────
export async function obtenerHistorialDocente(
  docenteId: number
): Promise<Observacion[]> {
  return db
    .select()
    .from(observaciones)
    .where(eq(observaciones.docenteId, docenteId))
    .orderBy(desc(observaciones.fecha));
}

// ─── Historial con filtros combinados + paginación ───────────────────────────
export async function obtenerHistorialFiltrado(opts: {
  docenteId?: number;
  alumno?: string;
  curso?: string;
  limit?: number;
  offset?: number;
}): Promise<{ observaciones: Observacion[]; total: number }> {
  const { limit = 20, offset = 0 } = opts;

  const conditions = [];
  if (opts.docenteId) conditions.push(eq(observaciones.docenteId, opts.docenteId));
  if (opts.alumno) conditions.push(like(observaciones.alumnoNombre, `%${opts.alumno}%`));
  if (opts.curso) conditions.push(like(observaciones.cursoNombre, `%${opts.curso}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(observaciones)
      .where(where)
      .orderBy(desc(observaciones.fecha))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(observaciones)
      .where(where)
  ]);

  return {
    observaciones: rows,
    total: Number(totalResult[0]?.count ?? 0)
  };
}
