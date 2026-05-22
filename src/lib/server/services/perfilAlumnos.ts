// Perfil integrado del alumno: cruza datos de conducta de legajo
// (observaciones, faltas, amonestaciones) con las notas académicas de Moodle.

import { inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { observaciones, faltasAlumnos, amonestaciones } from '../db/schema.js';
import { moodle } from '../moodle/client.js';
import { media } from '../agrupamientos/stats.js';

export interface ConductaAlumno {
  actitud: number | null;        // promedio de las observaciones
  participacion: number | null;  // promedio de las observaciones
  tareasOk: number | null;       // % de tareas completas
  observacionesCount: number;
  faltas: number;
  amonestaciones: number;
}

/** Datos de conducta de legajo (consulta local, rápida). */
export async function obtenerConducta(alumnoIds: number[]): Promise<Map<number, ConductaAlumno>> {
  const result = new Map<number, ConductaAlumno>();
  if (alumnoIds.length === 0) return result;

  const [obs, fal, amo] = await Promise.all([
    db.select().from(observaciones).where(inArray(observaciones.alumnoMoodleId, alumnoIds)),
    db.select().from(faltasAlumnos).where(inArray(faltasAlumnos.alumnoMoodleId, alumnoIds)),
    db.select().from(amonestaciones).where(inArray(amonestaciones.alumnoMoodleId, alumnoIds))
  ]);

  for (const id of alumnoIds) {
    const o = obs.filter((x) => x.alumnoMoodleId === id);
    const actitudes = o.map((x) => x.actitud).filter((n): n is number => n != null);
    const participaciones = o.map((x) => x.participacion).filter((n): n is number => n != null);
    const tareas = o.map((x) => x.tareaCompleta).filter((b): b is boolean => b != null);
    result.set(id, {
      actitud: actitudes.length ? Math.round(media(actitudes) * 10) / 10 : null,
      participacion: participaciones.length ? Math.round(media(participaciones) * 10) / 10 : null,
      tareasOk: tareas.length ? Math.round((tareas.filter(Boolean).length / tareas.length) * 100) : null,
      observacionesCount: o.length,
      faltas: fal.filter((x) => x.alumnoMoodleId === id).length,
      amonestaciones: amo.filter((x) => x.alumnoMoodleId === id).length
    });
  }
  return result;
}

/**
 * Notas académicas desde Moodle (nota total del curso, 0-100).
 * Hace una llamada al web service por alumno: usar sólo cuando se necesita.
 */
export async function obtenerNotasMoodle(
  cursoId: number,
  alumnoIds: number[]
): Promise<Map<number, number | null>> {
  const result = new Map<number, number | null>();
  for (const id of alumnoIds) {
    try {
      const g = await moodle.getGradeItems(cursoId, id);
      const total = g.gradeitems.find((it) => it.itemtype === 'course');
      const item = total ?? g.gradeitems.find((it) => it.gradepercent != null);
      result.set(id, item?.gradepercent ?? null);
    } catch {
      result.set(id, null);
    }
  }
  return result;
}
