import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { observaciones, amonestaciones, faltas, faltasAlumnos, actas, actasAlumnos } from '../db/schema.js';

/**
 * Trae todo el historial de un alumno por su Moodle ID:
 * observaciones, faltas, amonestaciones y actas en las que figura.
 */
export async function obtenerLegajoAlumno(alumnoMoodleId: number) {
  // 1. Consultas directas por alumnoMoodleId
  const [obsRows, amonRows, faltaAlumnoRows, actaAlumnoRows] = await Promise.all([
    db.select()
      .from(observaciones)
      .where(eq(observaciones.alumnoMoodleId, alumnoMoodleId))
      .orderBy(desc(observaciones.fecha), desc(observaciones.createdAt))
      .limit(200),

    db.select()
      .from(amonestaciones)
      .where(eq(amonestaciones.alumnoMoodleId, alumnoMoodleId))
      .orderBy(desc(amonestaciones.fecha))
      .limit(200),

    db.select({ faltaId: faltasAlumnos.faltaId, alumnoNombre: faltasAlumnos.alumnoNombre })
      .from(faltasAlumnos)
      .where(eq(faltasAlumnos.alumnoMoodleId, alumnoMoodleId))
      .limit(200),

    db.select({ actaId: actasAlumnos.actaId, alumnoNombre: actasAlumnos.alumnoNombre })
      .from(actasAlumnos)
      .where(eq(actasAlumnos.alumnoMoodleId, alumnoMoodleId))
      .limit(200)
  ]);

  // 2. Traer las faltas completas si hay registros
  const faltaIds = faltaAlumnoRows.map((r) => r.faltaId);
  const faltasRows = faltaIds.length > 0
    ? await db.select().from(faltas)
        .where(inArray(faltas.id, faltaIds))
        .orderBy(desc(faltas.fecha))
    : [];

  // 3. Traer las actas completas si hay registros
  const actaIds = actaAlumnoRows.map((r) => r.actaId);
  const actasRows = actaIds.length > 0
    ? await db.select().from(actas)
        .where(inArray(actas.id, actaIds))
        .orderBy(desc(actas.fecha))
    : [];

  // 4. Nombre del alumno: primer registro encontrado en cualquier tabla
  const alumnoNombre =
    obsRows[0]?.alumnoNombre ??
    amonRows[0]?.alumnoNombre ??
    faltaAlumnoRows[0]?.alumnoNombre ??
    actaAlumnoRows[0]?.alumnoNombre ??
    `Alumno #${alumnoMoodleId}`;

  return {
    alumnoMoodleId,
    alumnoNombre,
    observaciones: obsRows,
    amonestaciones: amonRows,
    faltas: faltasRows,
    actas: actasRows
  };
}
