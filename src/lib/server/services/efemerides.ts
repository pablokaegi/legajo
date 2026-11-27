import { desc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { efemerides } from '../db/schema.js';

export async function listarEfemerides(filtros: { page?: number; estado?: string } = {}) {
  const page  = Math.max(1, filtros.page ?? 1);
  const limit = 30;
  const offset = (page - 1) * limit;

  let q = db.select().from(efemerides)
    .orderBy(efemerides.fecha, efemerides.titulo)
    .limit(limit).offset(offset);

  if (filtros.estado) {
    q = q.where(eq(efemerides.estado, filtros.estado)) as typeof q;
  }
  return await q;
}

export async function obtenerEfemeride(id: number) {
  const [row] = await db.select().from(efemerides).where(eq(efemerides.id, id)).limit(1);
  return row ?? null;
}

export async function crearEfemeride(
  createdBy: number,
  data: {
    fecha: string;
    titulo: string;
    descripcion?: string;
    cursosResponsables?: string; // JSON string
    docenteResponsable?: string;
    estado?: string;
    notas?: string;
  }
) {
  const [result] = await db.insert(efemerides).values({
    fecha:              data.fecha,
    titulo:             data.titulo,
    descripcion:        data.descripcion ?? null,
    cursosResponsables: data.cursosResponsables ?? null,
    docenteResponsable: data.docenteResponsable ?? null,
    estado:             data.estado ?? 'planificado',
    notas:              data.notas ?? null,
    createdBy
  });
  return (result as { insertId: number }).insertId;
}

export async function editarEfemeride(
  id: number,
  data: Partial<{
    fecha: string;
    titulo: string;
    descripcion: string | null;
    cursosResponsables: string | null;
    docenteResponsable: string | null;
    estado: string;
    notas: string | null;
  }>
) {
  await db.update(efemerides).set({ ...data, updatedAt: new Date() }).where(eq(efemerides.id, id));
}

export async function eliminarEfemeride(id: number) {
  await db.delete(efemerides).where(eq(efemerides.id, id));
}
