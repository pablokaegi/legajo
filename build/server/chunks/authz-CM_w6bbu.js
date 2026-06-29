import { d as db, v as vinculosFamilia, r as roles } from './db-BwfbdrtT.js';
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
async function esStaff(usuarioId) {
	return (await rolesDe(usuarioId)).some((r) => r.rol === "admin" || r.rol === "docente" || r.rol === "preceptor" || r.rol === "directivo");
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
async function puedeVerAlumno(usuarioId, alumnoMoodleId) {
	const rs = await rolesDe(usuarioId);
	if (rs.some((r) => r.rol === "admin" || r.rol === "directivo" || r.rol === "docente" || r.rol === "preceptor")) return true;
	if (rs.some((r) => r.rol === "padre")) {
		const [v] = await db.select().from(vinculosFamilia).where(and(eq(vinculosFamilia.padreId, usuarioId), eq(vinculosFamilia.alumnoMoodleId, alumnoMoodleId), eq(vinculosFamilia.verificado, true))).limit(1);
		return !!v;
	}
	return false;
}
async function puedeCrearObservacion(usuarioId) {
	return esStaff(usuarioId);
}
async function puedeVerCurso(usuarioId, _cursoMoodleId) {
	return esStaff(usuarioId);
}
async function puedeGestionarFaltas(usuarioId) {
	return esPreceptorODirectivo(usuarioId);
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
async function puedeGestionarReincorporaciones(usuarioId) {
	return esPreceptorODirectivo(usuarioId);
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

export { puedeCrearActa as a, puedeEditarActa as b, puedeVerAmonestaciones as c, puedeGestionarAmonestaciones as d, esDirectivoOAdmin as e, puedeGestionarFaltas as f, esDirectivo as g, puedeVerFaltas as h, puedeVerCurso as i, puedeVerAlumno as j, puedeCrearObservacion as k, puedeGestionarReincorporaciones as l, esPreceptorODirectivo as m, puedeVerActas as p };
//# sourceMappingURL=authz-CM_w6bbu.js.map
