import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from '../db/index.js';
import { salidas } from '../db/schema.js';

export async function listarSalidas(filtros: { page?: number; estado?: string } = {}) {
  const page  = Math.max(1, filtros.page ?? 1);
  const limit = 30;
  const offset = (page - 1) * limit;

  let q = db.select().from(salidas)
    .orderBy(desc(salidas.fecha), desc(salidas.createdAt))
    .limit(limit).offset(offset);

  if (filtros.estado) {
    q = q.where(eq(salidas.estado, filtros.estado)) as typeof q;
  }
  return await q;
}

export async function obtenerSalida(id: number) {
  const [row] = await db.select().from(salidas).where(eq(salidas.id, id)).limit(1);
  return row ?? null;
}

export async function obtenerSalidaPorToken(token: string) {
  const [row] = await db.select().from(salidas).where(eq(salidas.uploadToken, token)).limit(1);
  return row ?? null;
}

export async function crearSalida(
  createdBy: number,
  data: {
    titulo: string;
    fecha: string;
    destino: string;
    descripcion?: string;
    responsableNombre: string;
    cursoNombre: string;
    cantidadAlumnos?: number;
    costoEstimado?: string;
    notas?: string;
  }
) {
  const uploadToken = randomUUID();
  const [result] = await db.insert(salidas).values({
    titulo:            data.titulo,
    fecha:             data.fecha,
    destino:           data.destino,
    descripcion:       data.descripcion ?? null,
    responsableNombre: data.responsableNombre,
    cursoNombre:       data.cursoNombre,
    cantidadAlumnos:   data.cantidadAlumnos ?? null,
    costoEstimado:     data.costoEstimado ?? null,
    estado:            'borrador',
    uploadToken,
    notas:             data.notas ?? null,
    createdBy
  });
  return { id: (result as { insertId: number }).insertId, uploadToken };
}

export async function editarSalida(
  id: number,
  data: Partial<{
    titulo: string;
    fecha: string;
    destino: string;
    descripcion: string | null;
    responsableNombre: string;
    cursoNombre: string;
    cantidadAlumnos: number | null;
    costoEstimado: string | null;
    estado: string;
    notas: string | null;
    documentoPath: string | null;
    documentoNombre: string | null;
    documentoSubidoAt: Date | null;
  }>
) {
  await db.update(salidas).set({ ...data, updatedAt: new Date() }).where(eq(salidas.id, id));
}
