import { d as db, o as observaciones, h as faltasAlumnos, j as amonestaciones } from './db-CLN6I8p_.js';
import { m as moodle } from './client-Dsrb4zGp.js';
import { e as media } from './agrupamientos-f9JamgYJ.js';
import { inArray } from 'drizzle-orm';

//#region src/lib/server/services/perfilAlumnos.ts
/** Datos de conducta de legajo (consulta local, rápida). */
async function obtenerConducta(alumnoIds) {
	const result = /* @__PURE__ */ new Map();
	if (alumnoIds.length === 0) return result;
	const [obs, fal, amo] = await Promise.all([
		db.select().from(observaciones).where(inArray(observaciones.alumnoMoodleId, alumnoIds)),
		db.select().from(faltasAlumnos).where(inArray(faltasAlumnos.alumnoMoodleId, alumnoIds)),
		db.select().from(amonestaciones).where(inArray(amonestaciones.alumnoMoodleId, alumnoIds))
	]);
	for (const id of alumnoIds) {
		const o = obs.filter((x) => x.alumnoMoodleId === id);
		const actitudes = o.map((x) => x.actitud).filter((n) => n != null);
		const participaciones = o.map((x) => x.participacion).filter((n) => n != null);
		const tareas = o.map((x) => x.tareaCompleta).filter((b) => b != null);
		result.set(id, {
			actitud: actitudes.length ? Math.round(media(actitudes) * 10) / 10 : null,
			participacion: participaciones.length ? Math.round(media(participaciones) * 10) / 10 : null,
			tareasOk: tareas.length ? Math.round(tareas.filter(Boolean).length / tareas.length * 100) : null,
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
async function obtenerNotasMoodle(cursoId, alumnoIds) {
	const result = /* @__PURE__ */ new Map();
	for (const id of alumnoIds) try {
		const total = (await moodle.getGradeItems(cursoId, id)).gradeitems.find((it) => it.itemtype === "course");
		result.set(id, total?.gradepercent ?? null);
	} catch {
		result.set(id, null);
	}
	return result;
}

export { obtenerConducta as a, obtenerNotasMoodle as o };
//# sourceMappingURL=perfilAlumnos-DJX-vZkW.js.map
