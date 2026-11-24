import { d as db, o as observaciones, g as amonestaciones, f as faltasAlumnos, q as actasAlumnos, p as faltas, t as actas, w as actasAsistentes } from './db-D7hI4G6x.js';
import { eq, desc, inArray, or, and } from 'drizzle-orm';

// src/lib/server/services/legajo.ts
/**
* Trae todo el historial de un alumno por su Moodle ID:
* observaciones, faltas, amonestaciones y actas en las que figura.
*
* `acceso` controla qué actas se exponen: directivos/admin ven todas; el resto
* solo las que creó o donde figura como asistente (mismo criterio que el módulo
* de actas — evita filtrar resumen/acuerdos de actas ajenas por esta vía).
*/
async function obtenerLegajoAlumno(alumnoMoodleId, acceso) {
	const [obsRows, amonRows, faltaAlumnoRows, actaAlumnoRows] = await Promise.all([
		db.select().from(observaciones).where(eq(observaciones.alumnoMoodleId, alumnoMoodleId)).orderBy(desc(observaciones.fecha), desc(observaciones.createdAt)).limit(200),
		db.select().from(amonestaciones).where(eq(amonestaciones.alumnoMoodleId, alumnoMoodleId)).orderBy(desc(amonestaciones.fecha)).limit(200),
		db.select({
			faltaId: faltasAlumnos.faltaId,
			alumnoNombre: faltasAlumnos.alumnoNombre
		}).from(faltasAlumnos).where(eq(faltasAlumnos.alumnoMoodleId, alumnoMoodleId)).limit(200),
		db.select({
			actaId: actasAlumnos.actaId,
			alumnoNombre: actasAlumnos.alumnoNombre
		}).from(actasAlumnos).where(eq(actasAlumnos.alumnoMoodleId, alumnoMoodleId)).limit(200)
	]);
	const faltaIds = faltaAlumnoRows.map((r) => r.faltaId);
	const faltasRows = faltaIds.length > 0 ? await db.select().from(faltas).where(inArray(faltas.id, faltaIds)).orderBy(desc(faltas.fecha)) : [];
	const actaIds = actaAlumnoRows.map((r) => r.actaId);
	let actasRows = [];
	if (actaIds.length > 0) {
		const conds = [inArray(actas.id, actaIds)];
		if (!acceso.verTodas) {
			const idsComoAsistente = db.select({ id: actasAsistentes.actaId }).from(actasAsistentes).where(eq(actasAsistentes.usuarioId, acceso.usuarioId));
			conds.push(or(eq(actas.createdBy, acceso.usuarioId), inArray(actas.id, idsComoAsistente)));
		}
		actasRows = await db.select().from(actas).where(and(...conds)).orderBy(desc(actas.fecha));
	}
	return {
		alumnoMoodleId,
		alumnoNombre: obsRows[0]?.alumnoNombre ?? amonRows[0]?.alumnoNombre ?? faltaAlumnoRows[0]?.alumnoNombre ?? actaAlumnoRows[0]?.alumnoNombre ?? `Alumno #${alumnoMoodleId}`,
		observaciones: obsRows,
		amonestaciones: amonRows,
		faltas: faltasRows,
		actas: actasRows
	};
}

export { obtenerLegajoAlumno as o };
//# sourceMappingURL=legajo-COo_CXYf.js.map
