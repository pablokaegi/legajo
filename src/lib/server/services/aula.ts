// Planos del aula: cómo quedaron sentados los alumnos de cada curso.
// Un plano es una lista de bancos; cada banco, una lista de asientos
// (alumno o lugar libre). Hay un plano "vigente" por curso y un historial.

import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { aulaPlanos } from '../db/schema.js';
import type { AlumnoRef } from '../agrupamientos/tipos.js';

export type Asiento = AlumnoRef | null;
export type Banco = Asiento[];

export function parseBancos(raw: string): Banco[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(Array.isArray)
      .map((b: unknown[]) =>
        b.map((s) => {
          const x = s as { id?: unknown; nombre?: unknown } | null;
          return x && Number.isInteger(Number(x.id)) ? { id: Number(x.id), nombre: String(x.nombre ?? '') } : null;
        })
      );
  } catch {
    return [];
  }
}

export async function listarPlanos(cursoMoodleId: number) {
  return db
    .select()
    .from(aulaPlanos)
    .where(eq(aulaPlanos.cursoMoodleId, cursoMoodleId))
    .orderBy(desc(aulaPlanos.createdAt));
}

export async function obtenerPlano(cursoMoodleId: number, id: number) {
  const [p] = await db
    .select()
    .from(aulaPlanos)
    .where(and(eq(aulaPlanos.id, id), eq(aulaPlanos.cursoMoodleId, cursoMoodleId)))
    .limit(1);
  return p ?? null;
}

export async function planoVigente(cursoMoodleId: number) {
  const [p] = await db
    .select()
    .from(aulaPlanos)
    .where(and(eq(aulaPlanos.cursoMoodleId, cursoMoodleId), eq(aulaPlanos.vigente, true)))
    .orderBy(desc(aulaPlanos.createdAt))
    .limit(1);
  return p ?? null;
}

/** Guarda un plano nuevo y lo deja como vigente del curso. */
export async function guardarPlano(data: {
  cursoMoodleId: number;
  cursoNombre: string;
  nombre: string;
  columnas: number;
  bancos: Banco[];
  origen: string;
  sesionId: number | null;
  createdBy: number;
}): Promise<number> {
  await db.update(aulaPlanos).set({ vigente: false }).where(eq(aulaPlanos.cursoMoodleId, data.cursoMoodleId));
  const [res] = await db.insert(aulaPlanos).values({
    cursoMoodleId: data.cursoMoodleId,
    cursoNombre: data.cursoNombre,
    nombre: data.nombre,
    columnas: data.columnas,
    bancosJson: JSON.stringify(data.bancos),
    origen: data.origen,
    sesionId: data.sesionId,
    vigente: true,
    createdBy: data.createdBy
  });
  return Number((res as { insertId: number }).insertId);
}

export async function marcarVigente(cursoMoodleId: number, id: number) {
  await db.update(aulaPlanos).set({ vigente: false }).where(eq(aulaPlanos.cursoMoodleId, cursoMoodleId));
  await db
    .update(aulaPlanos)
    .set({ vigente: true })
    .where(and(eq(aulaPlanos.id, id), eq(aulaPlanos.cursoMoodleId, cursoMoodleId)));
}

export async function eliminarPlano(cursoMoodleId: number, id: number) {
  await db.delete(aulaPlanos).where(and(eq(aulaPlanos.id, id), eq(aulaPlanos.cursoMoodleId, cursoMoodleId)));
}

/** Con quién comparte banco un alumno en los planos vigentes (para el legajo/ficha). */
export async function companerosDeBanco(alumnoMoodleId: number) {
  const vigentes = await db.select().from(aulaPlanos).where(eq(aulaPlanos.vigente, true));
  for (const p of vigentes) {
    const bancos = parseBancos(p.bancosJson);
    const i = bancos.findIndex((b) => b.some((s) => s?.id === alumnoMoodleId));
    if (i >= 0) {
      return {
        cursoNombre: p.cursoNombre,
        cursoMoodleId: p.cursoMoodleId,
        banco: i + 1,
        companeros: bancos[i].filter((s): s is AlumnoRef => s != null && s.id !== alumnoMoodleId)
      };
    }
  }
  return null;
}
