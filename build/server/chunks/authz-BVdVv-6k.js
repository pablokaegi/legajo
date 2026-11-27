import { d as db, v as vinculosFamilia, r as roles } from './db-CLN6I8p_.js';
import { and, eq } from 'drizzle-orm';

//#region src/lib/server/services/authz.ts
async function rolesDe(usuarioId) {
	return (await db.select({
		rol: roles.rol,
		scope: roles.scope
	}).from(roles).where(eq(roles.usuarioId, usuarioId))).map((r) => ({
		rol: r.rol,
		scope: r.scope
	}));
}
async function tieneRol(usuarioId, rol) {
	return (await rolesDe(usuarioId)).some((r) => r.rol === rol);
}
async function esAdmin(usuarioId) {
	return tieneRol(usuarioId, "admin");
}
async function esStaff(usuarioId) {
	return (await rolesDe(usuarioId)).some((r) => r.rol === "admin" || r.rol === "docente" || r.rol === "preceptor" || r.rol === "directivo" || r.rol === "gabinete");
}
async function esGabineteOAdmin(usuarioId) {
	return (await rolesDe(usuarioId)).some((r) => r.rol === "admin" || r.rol === "gabinete");
}
async function puedeVerEvidenciasDeGabinete(usuarioId, cursoId) {
	if (!Number.isSafeInteger(cursoId) || cursoId <= 0) return false;
	return gabineteParaCurso(await rolesDe(usuarioId), cursoId);
}
function gabineteParaCurso(rs, cursoId) {
	if (rs.some((r) => r.rol === "admin")) return true;
	const gabinete = rs.filter((r) => r.rol === "gabinete");
	if (!gabinete.length) return false;
	return gabinete.every((r) => r.scope === null) || gabinete.some((r) => r.scope === alcanceCurso(cursoId));
}
async function puedeGestionarFichaApoyo(usuarioId, cursoId) {
	if (!Number.isSafeInteger(cursoId) || cursoId <= 0) return false;
	const rs = await rolesDe(usuarioId);
	return gabineteParaCurso(rs, cursoId) || rs.some((r) => r.rol === "docente" && r.scope === alcanceCurso(cursoId));
}
async function esDirectivo(usuarioId) {
	return tieneRol(usuarioId, "directivo");
}
async function esDirectivoOAdmin(usuarioId) {
	return (await rolesDe(usuarioId)).some((r) => r.rol === "admin" || r.rol === "directivo");
}
async function esPreceptorODirectivo(usuarioId) {
	return (await rolesDe(usuarioId)).some((r) => r.rol === "admin" || r.rol === "preceptor" || r.rol === "directivo");
}
async function puedeCrearObservacion(usuarioId) {
	return esStaff(usuarioId);
}
function alcanceCurso(cursoId) {
	return `curso:${cursoId}`;
}
function idCursoDeAlcance(scope) {
	if (!scope || !/^curso:[1-9]\d*$/.test(scope)) return null;
	const id = Number(scope.slice(6));
	return Number.isSafeInteger(id) ? id : null;
}
function preceptorInstitucional(rs) {
	const preceptoria = rs.filter((r) => r.rol === "preceptor");
	return preceptoria.length > 0 && preceptoria.every((r) => r.scope === null);
}
function cursosDeRoles(rs) {
	if (rs.some((r) => r.rol === "admin" || r.rol === "directivo" || r.rol === "gabinete")) return null;
	if (preceptorInstitucional(rs)) return null;
	const ids = /* @__PURE__ */ new Set();
	for (const r of rs) {
		if (r.rol !== "docente" && r.rol !== "preceptor") continue;
		const id = idCursoDeAlcance(r.scope);
		if (id !== null) ids.add(id);
	}
	return [...ids];
}
async function puedeGestionarPreceptoriaCurso(usuarioId, cursoId) {
	if (!Number.isSafeInteger(cursoId) || cursoId <= 0) return false;
	const ids = await alcancePreceptoria(usuarioId);
	return ids === null || ids.includes(cursoId);
}
async function alcancePreceptoria(usuarioId) {
	return cursosDeRoles((await rolesDe(usuarioId)).filter((r) => r.rol === "admin" || r.rol === "directivo" || r.rol === "preceptor"));
}
async function veTodasLasSesionesDeCurso(usuarioId, cursoId) {
	if (!Number.isSafeInteger(cursoId) || cursoId <= 0) return false;
	const { cursosSupervisados } = await alcancesAgrupamientos(usuarioId);
	return cursosSupervisados === null || cursosSupervisados.includes(cursoId);
}
async function alcancesAgrupamientos(usuarioId) {
	const rs = await rolesDe(usuarioId);
	return {
		cursosPermitidos: cursosDeRoles(rs),
		cursosSupervisados: cursosDeRoles(rs.filter((r) => r.rol !== "docente"))
	};
}
/** null indica acceso institucional y [] indica que no tiene cursos asignados. */
async function alcanceCursos(usuarioId) {
	return cursosDeRoles(await rolesDe(usuarioId));
}
async function cursosVisiblesPara(usuarioId, cursos) {
	const alcance = await alcanceCursos(usuarioId);
	if (alcance === null) return cursos;
	const ids = new Set(alcance);
	return cursos.filter((c) => ids.has(c.id));
}
async function puedeVerCurso(usuarioId, cursoMoodleId) {
	if (!Number.isSafeInteger(cursoMoodleId) || cursoMoodleId <= 0) return false;
	const alcance = await alcanceCursos(usuarioId);
	return alcance === null || alcance.includes(cursoMoodleId);
}
async function puedeEvaluarCurso(usuarioId, cursoMoodleId) {
	if (!Number.isSafeInteger(cursoMoodleId) || cursoMoodleId <= 0) return false;
	const scope = alcanceCurso(cursoMoodleId);
	return (await rolesDe(usuarioId)).some((r) => r.rol === "admin" || r.rol === "docente" && r.scope === scope);
}
/** Para familia, las notas requieren vínculo verificado y pertenencia al curso en la ruta. */
async function puedeVerNotasCurso(usuarioId, cursoId, alumnoId) {
	if (!Number.isSafeInteger(cursoId) || cursoId <= 0) return false;
	const rs = await rolesDe(usuarioId);
	const alcance = cursosDeRoles(rs);
	if (alcance === null || alcance.includes(cursoId)) return true;
	if (!rs.some((r) => r.rol === "padre")) return false;
	const [vinculo] = await db.select({ padreId: vinculosFamilia.padreId }).from(vinculosFamilia).where(and(eq(vinculosFamilia.padreId, usuarioId), eq(vinculosFamilia.alumnoMoodleId, alumnoId), eq(vinculosFamilia.verificado, true))).limit(1);
	return !!vinculo;
}
async function puedeVerFaltas(usuarioId) {
	return esStaff(usuarioId);
}
async function puedeGestionarAmonestaciones(usuarioId) {
	return esPreceptorODirectivo(usuarioId);
}
async function puedeVerAmonestaciones(usuarioId) {
	return esStaff(usuarioId);
}
async function puedeCrearActa(usuarioId) {
	return esPreceptorODirectivo(usuarioId);
}
async function puedeVerActas(usuarioId) {
	return esPreceptorODirectivo(usuarioId);
}
async function puedeEditarActa(usuarioId) {
	return esPreceptorODirectivo(usuarioId);
}

export { esDirectivoOAdmin as a, esGabineteOAdmin as b, puedeVerActas as c, puedeCrearActa as d, esStaff as e, puedeEditarActa as f, puedeVerAmonestaciones as g, alcanceCursos as h, puedeGestionarAmonestaciones as i, alcancePreceptoria as j, puedeGestionarPreceptoriaCurso as k, esDirectivo as l, puedeVerFaltas as m, cursosVisiblesPara as n, puedeVerNotasCurso as o, puedeVerCurso as p, esPreceptorODirectivo as q, puedeEvaluarCurso as r, puedeGestionarFichaApoyo as s, alcanceCurso as t, idCursoDeAlcance as u, veTodasLasSesionesDeCurso as v, alcancesAgrupamientos as w, esAdmin as x, puedeVerEvidenciasDeGabinete as y, puedeCrearObservacion as z };
//# sourceMappingURL=authz-BVdVv-6k.js.map
