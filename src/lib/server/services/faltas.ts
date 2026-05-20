import { and, desc, eq, inArray, like, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { faltas, faltasAlumnos } from '../db/schema.js';

// ─── Schemas de validación ─────────────────────────────────────────────────────
export const AlumnoFaltaSchema = z.object({
  alumnoMoodleId: z.number().int().positive(),
  alumnoNombre: z.string().min(1).max(200),
  nota: z.string().max(1000).optional()
});

export const NuevaFaltaSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)').refine(
    (f) => f <= new Date().toISOString().split('T')[0],
    'La fecha no puede ser futura'
  ),
  tipo: z.enum(['ausente', 'retraso', 'salida_anticipada', 'otra']),
  descripcion: z.string().max(2000).optional(),
  cursoMoodleId: z.number().int().positive(),
  cursoNombre: z.string().min(1).max(200),
  alumnos: z.array(AlumnoFaltaSchema).min(1, 'Seleccioná al menos un alumno').max(500),
  estado: z.enum(['registrada', 'confirmada']).default('registrada'),
  visibilidad: z.enum(['publica', 'interna']).default('publica')
});

export type NuevaFaltaInput = z.infer<typeof NuevaFaltaSchema>;

// ─── Servicio ─────────────────────────────────────────────────────────────────
export async function crearFalta(
  preceptorId: number,
  data: NuevaFaltaInput
): Promise<number> {
  return await db.transaction(async (tx) => {
    const [result] = await tx.insert(faltas).values({
      fecha: data.fecha,
      tipo: data.tipo,
      descripcion: data.descripcion ?? null,
      preceptorId,
      cursoMoodleId: data.cursoMoodleId,
      cursoNombre: data.cursoNombre,
      estado: data.estado,
      visibilidad: data.visibilidad
    });

    const faltaId = (result as { insertId: number }).insertId;

    await tx.insert(faltasAlumnos).values(
      data.alumnos.map((a) => ({
        faltaId,
        alumnoMoodleId: a.alumnoMoodleId,
        alumnoNombre: a.alumnoNombre,
        nota: a.nota ?? null
      }))
    );

    return faltaId;
  });
}

export async function listarFaltas(filtros: {
  preceptorId?: number;
  cursoMoodleId?: number;
  alumnoMoodleId?: number;
  cursoQ?: string;   // búsqueda por nombre de curso (LIKE)
  alumnoQ?: string;  // búsqueda por nombre de alumno en faltas_alumnos (LIKE)
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filtros.page ?? 1);
  const limit = Math.min(100, filtros.limit ?? 20);
  const offset = (page - 1) * limit;

  const conditions = [];
  if (filtros.preceptorId) conditions.push(eq(faltas.preceptorId, filtros.preceptorId));
  if (filtros.cursoMoodleId) conditions.push(eq(faltas.cursoMoodleId, filtros.cursoMoodleId));
  if (filtros.cursoQ) conditions.push(like(faltas.cursoNombre, `%${filtros.cursoQ}%`));

  // Filtro por nombre de alumno: buscar en faltas_alumnos y obtener los falta IDs
  if (filtros.alumnoQ) {
    const matches = await db
      .selectDistinct({ faltaId: faltasAlumnos.faltaId })
      .from(faltasAlumnos)
      .where(like(faltasAlumnos.alumnoNombre, `%${filtros.alumnoQ}%`));
    const ids = matches.map((r) => r.faltaId);
    if (ids.length === 0) return [];
    conditions.push(inArray(faltas.id, ids));
  }

  let query = db
    .select()
    .from(faltas)
    .orderBy(desc(faltas.fecha), desc(faltas.createdAt))
    .limit(limit)
    .offset(offset);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  const rows = await query;

  // Filtro legacy por alumnoMoodleId
  if (filtros.alumnoMoodleId) {
    const alumnoFaltas = await db
      .select({ faltaId: faltasAlumnos.faltaId })
      .from(faltasAlumnos)
      .where(eq(faltasAlumnos.alumnoMoodleId, filtros.alumnoMoodleId));
    const ids = new Set(alumnoFaltas.map((f) => f.faltaId));
    return rows.filter((r) => ids.has(r.id));
  }

  return rows;
}

export async function listarFaltasConAlumnos(filtros: Parameters<typeof listarFaltas>[0]) {
  const rows = await listarFaltas(filtros);
  if (rows.length === 0) return [];

  const ids = rows.map((f) => f.id);
  const todosAlumnos = await db
    .select()
    .from(faltasAlumnos)
    .where(inArray(faltasAlumnos.faltaId, ids));

  const porFalta = new Map<number, typeof todosAlumnos>();
  for (const a of todosAlumnos) {
    if (!porFalta.has(a.faltaId)) porFalta.set(a.faltaId, []);
    porFalta.get(a.faltaId)!.push(a);
  }

  return rows.map((f) => ({ ...f, alumnos: porFalta.get(f.id) ?? [] }));
}

export async function obtenerFaltaConAlumnos(id: number) {
  const [falta] = await db.select().from(faltas).where(eq(faltas.id, id)).limit(1);
  if (!falta) return null;

  const alumnos = await db
    .select()
    .from(faltasAlumnos)
    .where(eq(faltasAlumnos.faltaId, id));

  return { ...falta, alumnos };
}

export async function contarFaltasPorAlumno(alumnoMoodleId: number): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(faltasAlumnos)
    .where(eq(faltasAlumnos.alumnoMoodleId, alumnoMoodleId));
  return Number(row?.count ?? 0);
}
