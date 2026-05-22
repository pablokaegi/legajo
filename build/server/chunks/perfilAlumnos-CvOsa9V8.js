import { d as db, o as observaciones, f as faltasAlumnos, a as amonestaciones } from './db-BwwlYHWL.js';
import { m as moodle } from './client-Caj_4xk9.js';
import { inArray } from 'drizzle-orm';

//#region src/lib/server/agrupamientos/stats.ts
function media(nums) {
	if (nums.length === 0) return 0;
	return nums.reduce((a, b) => a + b, 0) / nums.length;
}
function mediana(nums) {
	if (nums.length === 0) return 0;
	const s = [...nums].sort((a, b) => a - b);
	const mid = Math.floor(s.length / 2);
	return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}
/** Desviación estándar muestral (igual que statistics.stdev de Python). */
function desviacion(nums) {
	if (nums.length < 2) return 0;
	const m = media(nums);
	const varianza = nums.reduce((a, b) => a + (b - m) ** 2, 0) / (nums.length - 1);
	return Math.sqrt(varianza);
}
function redondear(n, decimales = 2) {
	const f = 10 ** decimales;
	return Math.round(n * f) / f;
}
//#endregion
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
		const g = await moodle.getGradeItems(cursoId, id);
		const item = g.gradeitems.find((it) => it.itemtype === "course") ?? g.gradeitems.find((it) => it.gradepercent != null);
		result.set(id, item?.gradepercent ?? null);
	} catch {
		result.set(id, null);
	}
	return result;
}

export { mediana as a, obtenerNotasMoodle as b, desviacion as d, media as m, obtenerConducta as o, redondear as r };
//# sourceMappingURL=perfilAlumnos-CvOsa9V8.js.map
