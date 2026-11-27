import { and, desc, eq, inArray, or } from 'drizzle-orm';
import { db } from '../db/index.js';
import { observaciones, amonestaciones, faltas, faltasAlumnos, actas, actasAlumnos, actasAsistentes } from '../db/schema.js';

/**
 * Trae todo el historial de un alumno por su Moodle ID:
 * observaciones, faltas, amonestaciones y actas en las que figura.
 *
 * `acceso` controla qué actas se exponen: directivos/admin ven todas; el resto
 * solo las que creó o donde figura como asistente (mismo criterio que el módulo
 * de actas — evita filtrar resumen/acuerdos de actas ajenas por esta vía).
 */
export async function obtenerLegajoAlumno(
  alumnoMoodleId: number,
  acceso: { usuarioId: number; verTodas: boolean; cursosPermitidos?: number[] | null }
) {
  const scope = acceso.cursosPermitidos;
  const cursoEn = (campo: typeof observaciones.cursoMoodleId | typeof amonestaciones.cursoMoodleId | typeof faltas.cursoMoodleId) =>
    scope ? inArray(campo, scope) : undefined;
  // 1. Consultas directas por alumnoMoodleId
  const [obsRows, amonRows, faltaAlumnoRows, actaAlumnoRows] = await Promise.all([
    db.select()
      .from(observaciones)
      .where(and(eq(observaciones.alumnoMoodleId, alumnoMoodleId), cursoEn(observaciones.cursoMoodleId)))
      .orderBy(desc(observaciones.fecha), desc(observaciones.createdAt))
      .limit(200),

    db.select()
      .from(amonestaciones)
      .where(and(eq(amonestaciones.alumnoMoodleId, alumnoMoodleId), cursoEn(amonestaciones.cursoMoodleId)))
      .orderBy(desc(amonestaciones.fecha))
      .limit(200),

    db.select({ faltaId: faltasAlumnos.faltaId, alumnoNombre: faltasAlumnos.alumnoNombre })
      .from(faltasAlumnos)
      .innerJoin(faltas, eq(faltasAlumnos.faltaId, faltas.id))
      .where(and(eq(faltasAlumnos.alumnoMoodleId, alumnoMoodleId), cursoEn(faltas.cursoMoodleId)))
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

  // 3. Traer las actas completas si hay registros (filtradas por pertenencia)
  const actaIds = actaAlumnoRows.map((r) => r.actaId);
  let actasRows: Array<typeof actas.$inferSelect> = [];
  if (actaIds.length > 0) {
    const conds = [inArray(actas.id, actaIds)];
    if (!acceso.verTodas) {
      const idsComoAsistente = db
        .select({ id: actasAsistentes.actaId })
        .from(actasAsistentes)
        .where(eq(actasAsistentes.usuarioId, acceso.usuarioId));
      conds.push(
        or(eq(actas.createdBy, acceso.usuarioId), inArray(actas.id, idsComoAsistente))!
      );
    }
    actasRows = await db.select().from(actas).where(and(...conds)).orderBy(desc(actas.fecha));
  }

  // 4. Nombre del alumno: primer registro encontrado en cualquier tabla
  const alumnoNombre =
    obsRows[0]?.alumnoNombre ??
    amonRows[0]?.alumnoNombre ??
    faltaAlumnoRows[0]?.alumnoNombre ??
    (actasRows.length ? actaAlumnoRows.find((r) => actasRows.some((a) => a.id === r.actaId))?.alumnoNombre : undefined) ??
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
