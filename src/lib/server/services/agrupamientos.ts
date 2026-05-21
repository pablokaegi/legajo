import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { agrupamientoSesiones, agrupamientoVotos } from '../db/schema.js';
import type { Calificacion, VotoParsed } from '../agrupamientos/tipos.js';

// ─── Sesiones ─────────────────────────────────────────────────────────────────

export async function listarSesiones(filtros: { estado?: string } = {}) {
  let q = db
    .select()
    .from(agrupamientoSesiones)
    .orderBy(desc(agrupamientoSesiones.fecha), desc(agrupamientoSesiones.createdAt));

  if (filtros.estado) {
    q = q.where(eq(agrupamientoSesiones.estado, filtros.estado)) as typeof q;
  }
  const sesiones = await q;

  // Conteo de votos por sesión (dataset chico → N+1 aceptable)
  const result = [];
  for (const s of sesiones) {
    const votos = await db
      .select({ id: agrupamientoVotos.id })
      .from(agrupamientoVotos)
      .where(eq(agrupamientoVotos.sesionId, s.id));
    result.push({ ...s, cantidadVotos: votos.length });
  }
  return result;
}

export async function obtenerSesion(id: number) {
  const [row] = await db
    .select()
    .from(agrupamientoSesiones)
    .where(eq(agrupamientoSesiones.id, id))
    .limit(1);
  return row ?? null;
}

export async function crearSesion(
  createdBy: number,
  data: {
    cursoMoodleId: number;
    cursoNombre: string;
    titulo: string;
    fecha: string;
    notas?: string;
  }
) {
  const [result] = await db.insert(agrupamientoSesiones).values({
    cursoMoodleId: data.cursoMoodleId,
    cursoNombre: data.cursoNombre,
    titulo: data.titulo,
    fecha: data.fecha,
    estado: 'abierta',
    notas: data.notas ?? null,
    createdBy
  });
  return (result as { insertId: number }).insertId;
}

export async function editarSesion(
  id: number,
  data: Partial<{
    titulo: string;
    fecha: string;
    estado: string;
    notas: string | null;
  }>
) {
  await db
    .update(agrupamientoSesiones)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(agrupamientoSesiones.id, id));
}

export async function eliminarSesion(id: number) {
  // Los votos se eliminan en cascada (FK ON DELETE CASCADE)
  await db.delete(agrupamientoSesiones).where(eq(agrupamientoSesiones.id, id));
}

// ─── Votos ────────────────────────────────────────────────────────────────────

function parseCalificaciones(raw: string): Calificacion[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .map((c: { id: unknown; nombre: unknown; puntaje: unknown }) => ({
        id: Number(c.id),
        nombre: String(c.nombre ?? ''),
        puntaje: Number(c.puntaje)
      }))
      .filter((c: Calificacion) => c.id > 0 && c.puntaje >= 1 && c.puntaje <= 5);
  } catch {
    return [];
  }
}

export async function listarVotos(sesionId: number): Promise<VotoParsed[]> {
  const rows = await db
    .select()
    .from(agrupamientoVotos)
    .where(eq(agrupamientoVotos.sesionId, sesionId))
    .orderBy(agrupamientoVotos.votanteNombre);

  return rows.map((r) => ({
    id: r.id,
    votanteMoodleId: r.votanteMoodleId,
    votanteNombre: r.votanteNombre,
    calificaciones: parseCalificaciones(r.calificaciones),
    bloqueadoMoodleId: r.bloqueadoMoodleId,
    bloqueadoNombre: r.bloqueadoNombre
  }));
}

/** Inserta o actualiza el voto de un alumno (upsert por sesión + votante). */
export async function guardarVoto(
  sesionId: number,
  voto: {
    votanteMoodleId: number;
    votanteNombre: string;
    calificaciones: Calificacion[];
    bloqueadoMoodleId?: number | null;
    bloqueadoNombre?: string | null;
  }
) {
  const calificacionesJson = JSON.stringify(voto.calificaciones);

  const [existente] = await db
    .select({ id: agrupamientoVotos.id })
    .from(agrupamientoVotos)
    .where(
      and(
        eq(agrupamientoVotos.sesionId, sesionId),
        eq(agrupamientoVotos.votanteMoodleId, voto.votanteMoodleId)
      )
    )
    .limit(1);

  if (existente) {
    await db
      .update(agrupamientoVotos)
      .set({
        votanteNombre: voto.votanteNombre,
        calificaciones: calificacionesJson,
        bloqueadoMoodleId: voto.bloqueadoMoodleId ?? null,
        bloqueadoNombre: voto.bloqueadoNombre ?? null,
        updatedAt: new Date()
      })
      .where(eq(agrupamientoVotos.id, existente.id));
    return existente.id;
  }

  const [result] = await db.insert(agrupamientoVotos).values({
    sesionId,
    votanteMoodleId: voto.votanteMoodleId,
    votanteNombre: voto.votanteNombre,
    calificaciones: calificacionesJson,
    bloqueadoMoodleId: voto.bloqueadoMoodleId ?? null,
    bloqueadoNombre: voto.bloqueadoNombre ?? null
  });
  return (result as { insertId: number }).insertId;
}

export async function eliminarVoto(votoId: number) {
  await db.delete(agrupamientoVotos).where(eq(agrupamientoVotos.id, votoId));
}
