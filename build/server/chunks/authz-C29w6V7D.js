import { d as db, v as vinculosFamilia, r as roles } from './db-CnhT25Eo.js';
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

export { esDirectivoOAdmin as a, esPreceptorODirectivo as b, puedeCrearActa as c, puedeEditarActa as d, esStaff as e, puedeVerAmonestaciones as f, puedeGestionarAmonestaciones as g, puedeGestionarFaltas as h, esDirectivo as i, puedeVerFaltas as j, puedeVerCurso as k, puedeVerAlumno as l, puedeCrearObservacion as m, puedeGestionarReincorporaciones as n, esAdmin as o, puedeVerActas as p };
//# sourceMappingURL=authz-C29w6V7D.js.map
