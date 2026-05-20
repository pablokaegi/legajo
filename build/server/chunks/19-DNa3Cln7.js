import { d as db, o as observaciones, b as amonestaciones, f as faltasAlumnos, c as actasAlumnos, e as faltas, g as actas } from './db-XKMgjins.js';
import { redirect, error } from '@sveltejs/kit';
import { eq, desc, inArray } from 'drizzle-orm';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';

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
	return { legajo: await obtenerLegajoAlumno(alumnoMoodleId) };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 19;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DDqTXUbw.js')).default;
const server_id = "src/routes/preceptor/legajo/[alumnoId]/+page.server.ts";
const imports = ["_app/immutable/nodes/19.B6nfjKzg.js","_app/immutable/chunks/BCmZRGrY.js","_app/immutable/chunks/2TU3FloQ.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=19-DNa3Cln7.js.map
