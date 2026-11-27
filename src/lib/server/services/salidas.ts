import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from '../db/index.js';
import { salidas, salidasAutorizaciones } from '../db/schema.js';

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

// ─── Autorizaciones por alumno ────────────────────────────────────────────────

export async function crearAutorizacionesDeSalida(
  salidaId: number,
  alumnos: Array<{ alumnoMoodleId: number; alumnoNombre: string }>
) {
  // Insertamos sólo los que no existen todavía (ignorar duplicados)
  const values = alumnos.map(a => ({
    salidaId,
    alumnoMoodleId: a.alumnoMoodleId,
    alumnoNombre:   a.alumnoNombre,
    uploadToken:    randomUUID()
  }));
  if (values.length === 0) return 0;
  // INSERT IGNORE-style: ignorar si ya existe el par (salidaId, alumnoMoodleId)
  for (const v of values) {
    try {
      await db.insert(salidasAutorizaciones).values(v);
    } catch {
      // unique constraint violation → ya existe, salteamos
    }
  }
  return values.length;
}

export async function listarAutorizacionesDeSalida(salidaId: number) {
  return db
    .select()
    .from(salidasAutorizaciones)
    .where(eq(salidasAutorizaciones.salidaId, salidaId))
    .orderBy(salidasAutorizaciones.alumnoNombre);
}

export async function obtenerAutorizacionPorToken(token: string) {
  const [row] = await db
    .select()
    .from(salidasAutorizaciones)
    .where(eq(salidasAutorizaciones.uploadToken, token))
    .limit(1);
  if (!row) return null;
  const salida = await obtenerSalida(row.salidaId);
  return salida ? { ...row, salida } : null;
}

export async function marcarAutorizacionSubida(
  id: number,
  documentoPath: string,
  documentoNombre: string
) {
  await db
    .update(salidasAutorizaciones)
    .set({ documentoPath, documentoNombre, documentoSubidoAt: new Date() })
    .where(eq(salidasAutorizaciones.id, id));
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
