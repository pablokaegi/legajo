import { d as db, o as observaciones, a as amonestaciones, f as faltasAlumnos, p as actasAlumnos, x as faltas, m as actas } from './db-BwwlYHWL.js';
import { v as obtenerHistorialAgrupamientosDeAlumno } from './agrupamientos-BFNT9uir.js';
import { redirect, error } from '@sveltejs/kit';
import { eq, desc, inArray } from 'drizzle-orm';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'node:crypto';

//#region src/lib/server/services/legajo.ts
/**
* Trae todo el historial de un alumno por su Moodle ID:
* observaciones, faltas, amonestaciones y actas en las que figura.
*/
async function obtenerLegajoAlumno(alumnoMoodleId) {
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
	const actasRows = actaIds.length > 0 ? await db.select().from(actas).where(inArray(actas.id, actaIds)).orderBy(desc(actas.fecha)) : [];
	return {
		alumnoMoodleId,
		alumnoNombre: obsRows[0]?.alumnoNombre ?? amonRows[0]?.alumnoNombre ?? faltaAlumnoRows[0]?.alumnoNombre ?? actaAlumnoRows[0]?.alumnoNombre ?? `Alumno #${alumnoMoodleId}`,
		observaciones: obsRows,
		amonestaciones: amonRows,
		faltas: faltasRows,
		actas: actasRows
	};
}
//#endregion
//#region src/routes/preceptor/legajo/[alumnoId]/+page.server.ts
var load = async ({ locals, params }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const alumnoMoodleId = parseInt(params.alumnoId, 10);
	if (isNaN(alumnoMoodleId) || alumnoMoodleId <= 0) throw error(400, "ID inválido");
	const [legajo, agrupamientos] = await Promise.all([obtenerLegajoAlumno(alumnoMoodleId), obtenerHistorialAgrupamientosDeAlumno(alumnoMoodleId).catch(() => [])]);
	return {
		legajo,
		agrupamientos
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 34;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-pCd0VvpR.js')).default;
const server_id = "src/routes/preceptor/legajo/[alumnoId]/+page.server.ts";
const imports = ["_app/immutable/nodes/34.B_g0zkTG.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/BEDIq91W.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=34-CyGk7GcD.js.map
