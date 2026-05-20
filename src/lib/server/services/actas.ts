import { desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { actas, actasAsistentes, actasAlumnos, actasTareas, actasVersiones } from '../db/schema.js';

// ─── Schemas ───────────────────────────────────────────────────────────────────
const TareaSchema = z.object({
  descripcion: z.string().min(1).max(2000),
  responsableId: z.number().int().positive().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

const AsistenteSchema = z.object({
  usuarioId: z.number().int().positive(),
  rol: z.string().max(32).optional()
});

const AlumnoActaSchema = z.object({
  alumnoMoodleId: z.number().int().positive(),
  alumnoNombre: z.string().min(1).max(200)
});

export const NuevaActaSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  titulo: z.string().min(1, 'El título es requerido').max(300),
  resumen: z.string().min(1, 'El resumen es requerido').max(10000),
  acuerdos: z.string().max(10000).optional(),
  asistentes: z.array(AsistenteSchema).max(50).optional().default([]),
  alumnos: z.array(AlumnoActaSchema).max(200).optional().default([]),
  tareas: z.array(TareaSchema).max(50).optional().default([])
});

export const EditarActaSchema = z.object({
  titulo: z.string().min(1).max(300).optional(),
  resumen: z.string().min(1).max(10000).optional(),
  acuerdos: z.string().max(10000).optional(),
  estado: z.enum(['abierta', 'cerrada']).optional(),
  tareas: z.array(TareaSchema.extend({
    id: z.number().int().positive().optional(),
    estado: z.enum(['pendiente', 'en_progreso', 'completada']).optional()
  })).max(50).optional()
});

export type NuevaActaInput = z.infer<typeof NuevaActaSchema>;
export type EditarActaInput = z.infer<typeof EditarActaSchema>;

// ─── Servicio ─────────────────────────────────────────────────────────────────
export async function crearActa(
  createdBy: number,
  data: NuevaActaInput
): Promise<number> {
  return await db.transaction(async (tx) => {
    const [result] = await tx.insert(actas).values({
      fecha: data.fecha,
      titulo: data.titulo,
      resumen: data.resumen,
      acuerdos: data.acuerdos ?? null,
      estado: 'abierta',
      createdBy
    });
    const actaId = (result as { insertId: number }).insertId;

    if (data.asistentes.length > 0) {
      await tx.insert(actasAsistentes).values(
        data.asistentes.map((a) => ({
          actaId,
          usuarioId: a.usuarioId,
          rol: a.rol ?? null
        }))
      );
    }

    if (data.alumnos.length > 0) {
      await tx.insert(actasAlumnos).values(
        data.alumnos.map((a) => ({
          actaId,
          alumnoMoodleId: a.alumnoMoodleId,
          alumnoNombre: a.alumnoNombre
        }))
      );
    }

    if (data.tareas.length > 0) {
      await tx.insert(actasTareas).values(
        data.tareas.map((t) => ({
          actaId,
          descripcion: t.descripcion,
          responsableId: t.responsableId ?? null,
          dueDate: t.dueDate ?? null,
          estado: 'pendiente' as const
        }))
      );
    }

    return actaId;
  });
}

export async function editarActa(
  actaId: number,
  editadoPor: number,
  data: EditarActaInput
): Promise<void> {
  await db.transaction(async (tx) => {
    // Guardar versión anterior antes de editar
    const [actual] = await tx.select().from(actas).where(eq(actas.id, actaId)).limit(1);
    if (!actual) throw new Error('Acta no encontrada');

    await tx.insert(actasVersiones).values({
      actaId,
      resumen: actual.resumen,
      acuerdos: actual.acuerdos ?? null,
      editadoPor
    });

    // Actualizar campos del acta
    const updates: Partial<typeof actas.$inferInsert> = {};
    if (data.titulo !== undefined) updates.titulo = data.titulo;
    if (data.resumen !== undefined) updates.resumen = data.resumen;
    if (data.acuerdos !== undefined) updates.acuerdos = data.acuerdos;
    if (data.estado !== undefined) updates.estado = data.estado;

    if (Object.keys(updates).length > 0) {
      await tx.update(actas).set(updates).where(eq(actas.id, actaId));
    }

    // Actualizar tareas si se incluyen
    if (data.tareas) {
      for (const tarea of data.tareas) {
        if (tarea.id) {
          await tx
            .update(actasTareas)
            .set({
              descripcion: tarea.descripcion,
              responsableId: tarea.responsableId ?? null,
              dueDate: tarea.dueDate ?? null,
              estado: tarea.estado ?? 'pendiente'
            })
            .where(eq(actasTareas.id, tarea.id));
        } else {
          await tx.insert(actasTareas).values({
            actaId,
            descripcion: tarea.descripcion,
            responsableId: tarea.responsableId ?? null,
            dueDate: tarea.dueDate ?? null,
            estado: tarea.estado ?? 'pendiente'
          });
        }
      }
    }
  });
}

export async function obtenerActaCompleta(id: number) {
  const [acta] = await db.select().from(actas).where(eq(actas.id, id)).limit(1);
  if (!acta) return null;

  const [asistentes, alumnos, tareas, versiones] = await Promise.all([
    db.select().from(actasAsistentes).where(eq(actasAsistentes.actaId, id)),
    db.select().from(actasAlumnos).where(eq(actasAlumnos.actaId, id)),
    db.select().from(actasTareas).where(eq(actasTareas.actaId, id)),
    db.select().from(actasVersiones)
      .where(eq(actasVersiones.actaId, id))
      .orderBy(desc(actasVersiones.createdAt))
      .limit(20)
  ]);

  return { ...acta, asistentes, alumnos, tareas, versiones };
}

export async function listarActas(filtros: {
  createdBy?: number;
  estado?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filtros.page ?? 1);
  const limit = Math.min(50, filtros.limit ?? 20);
  const offset = (page - 1) * limit;

  let query = db
    .select()
    .from(actas)
    .orderBy(desc(actas.fecha), desc(actas.createdAt))
    .limit(limit)
    .offset(offset);

  if (filtros.estado) {
    query = query.where(eq(actas.estado, filtros.estado)) as typeof query;
  }

  return await query;
}

/** Lista actas incluyendo los alumnos involucrados (para filtrado client-side). */
export async function listarActasConAlumnos(filtros: Parameters<typeof listarActas>[0]) {
  const rows = await listarActas(filtros);
  if (rows.length === 0) return [];

  const ids = rows.map((a) => a.id);
  const todosAlumnos = await db
    .select()
    .from(actasAlumnos)
    .where(inArray(actasAlumnos.actaId, ids as [number, ...number[]]));

  const porActa = new Map<number, typeof todosAlumnos>();
  for (const a of todosAlumnos) {
    if (!porActa.has(a.actaId)) porActa.set(a.actaId, []);
    porActa.get(a.actaId)!.push(a);
  }

  return rows.map((a) => ({ ...a, alumnos: porActa.get(a.id) ?? [] }));
}
