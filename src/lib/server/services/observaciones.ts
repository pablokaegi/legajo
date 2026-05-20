import { eq, and, desc, sql, like } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { observaciones } from '../db/schema.js';
import type { Observacion } from '../db/schema.js';

export const ObservacionSchema = z.object({
  alumnoMoodleId: z.number().int().positive(),
  alumnoNombre: z.string().min(1).max(200),
  cursoMoodleId: z.number().int().positive(),
  cursoNombre: z.string().min(1).max(200),
  actitud: z.number().int().min(1).max(5).optional().nullable(),
  tareaCompleta: z.boolean().optional().nullable(),
  participacion: z.number().int().min(1).max(5).optional().nullable(),
  observacionTexto: z.string().max(500).optional().nullable(),
  fecha: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha invalido (YYYY-MM-DD)')
    .refine((val) => !isNaN(Date.parse(val)), 'Fecha invalida')
});

export type ObservacionInput = z.infer<typeof ObservacionSchema>;

// Campos compartidos (sin alumno) para observaciones masivas
export const ObservacionBaseSchema = ObservacionSchema.omit({
  alumnoMoodleId: true,
  alumnoNombre: true
});
export type ObservacionBase = z.infer<typeof ObservacionBaseSchema>;

// Escapa los wildcards de LIKE (% y _) para que la busqueda sea literal.
function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, '\\$&');
}

export async function crearObservacion(
  usuarioId: number,
  input: ObservacionInput
): Promise<number> {
  const validated = ObservacionSchema.parse(input);

  const result = await db.insert(observaciones).values({
    usuarioId,
    ...validated
  });

  return Number(result[0].insertId);
}

export async function crearObservacionesBulk(
  usuarioId: number,
  alumnos: Array<{ alumnoMoodleId: number; alumnoNombre: string }>,
  base: ObservacionBase
): Promise<number> {
  if (alumnos.length === 0) return 0;

  const validatedBase = ObservacionBaseSchema.parse(base);
  const rows = alumnos.map(a => ({
    usuarioId,
    alumnoMoodleId: a.alumnoMoodleId,
    alumnoNombre: a.alumnoNombre,
    ...validatedBase
  }));

  await db.insert(observaciones).values(rows);
  return rows.length;
}

export async function obtenerHistorialAlumno(
  alumnoMoodleId: number
): Promise<Observacion[]> {
  return db
    .select()
    .from(observaciones)
    .where(eq(observaciones.alumnoMoodleId, alumnoMoodleId))
    .orderBy(desc(observaciones.fecha));
}

export async function obtenerHistorialCurso(
  cursoMoodleId: number
): Promise<Observacion[]> {
  return db
    .select()
    .from(observaciones)
    .where(eq(observaciones.cursoMoodleId, cursoMoodleId))
    .orderBy(desc(observaciones.fecha));
}

export async function obtenerHistorialUsuario(
  usuarioId: number
): Promise<Observacion[]> {
  return db
    .select()
    .from(observaciones)
    .where(eq(observaciones.usuarioId, usuarioId))
    .orderBy(desc(observaciones.fecha));
}

// usuarioId siempre requerido. Si quien consulta es directivo y quiere ver
// todo, pasar `omitUsuarioFilter: true` explicitamente.
export async function obtenerHistorialFiltrado(opts: {
  usuarioId: number;
  alumno?: string;
  curso?: string;
  limit?: number;
  offset?: number;
  omitUsuarioFilter?: boolean;
}): Promise<{ observaciones: Observacion[]; total: number }> {
  const { limit = 20, offset = 0 } = opts;

  const conditions = [];
  if (!opts.omitUsuarioFilter) {
    conditions.push(eq(observaciones.usuarioId, opts.usuarioId));
  }
  if (opts.alumno) conditions.push(like(observaciones.alumnoNombre, `%${escapeLike(opts.alumno)}%`));
  if (opts.curso) conditions.push(like(observaciones.cursoNombre, `%${escapeLike(opts.curso)}%`));

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
