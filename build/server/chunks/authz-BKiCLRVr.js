import { d as db, v as vinculosFamilia, r as roles } from './db-D9cZesji.js';
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
	return (await rolesDe(usuarioId)).some((r) => r.rol === "docente" || r.rol === "preceptor" || r.rol === "directivo");
}
async function esDirectivo(usuarioId) {
	return tieneRol(usuarioId, "directivo");
}
async function puedeVerAlumno(usuarioId, alumnoMoodleId) {
	const rs = await rolesDe(usuarioId);
	if (rs.some((r) => r.rol === "directivo" || r.rol === "docente" || r.rol === "preceptor")) return true;
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

export { puedeVerAlumno as a, puedeCrearObservacion as b, esDirectivo as e, puedeVerCurso as p };
//# sourceMappingURL=authz-BKiCLRVr.js.map
