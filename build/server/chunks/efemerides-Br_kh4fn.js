import { d as db, e as efemerides } from './db-BEC8cTGI.js';
import { eq } from 'drizzle-orm';

//#region src/lib/server/services/efemerides.ts
async function listarEfemerides(filtros = {}) {
	const page = Math.max(1, filtros.page ?? 1);
	const limit = 30;
	const offset = (page - 1) * limit;
	let q = db.select().from(efemerides).orderBy(efemerides.fecha, efemerides.titulo).limit(limit).offset(offset);
	if (filtros.estado) q = q.where(eq(efemerides.estado, filtros.estado));
	return await q;
}
async function obtenerEfemeride(id) {
	const [row] = await db.select().from(efemerides).where(eq(efemerides.id, id)).limit(1);
	return row ?? null;
}
async function crearEfemeride(createdBy, data) {
	const [result] = await db.insert(efemerides).values({
		fecha: data.fecha,
		titulo: data.titulo,
		descripcion: data.descripcion ?? null,
		cursosResponsables: data.cursosResponsables ?? null,
		docenteResponsable: data.docenteResponsable ?? null,
		estado: data.estado ?? "planificado",
		notas: data.notas ?? null,
		createdBy
	});
	return result.insertId;
}
async function editarEfemeride(id, data) {
	await db.update(efemerides).set({
		...data,
		updatedAt: /* @__PURE__ */ new Date()
	}).where(eq(efemerides.id, id));
}
async function eliminarEfemeride(id) {
	await db.delete(efemerides).where(eq(efemerides.id, id));
}

export { editarEfemeride as a, crearEfemeride as c, eliminarEfemeride as e, listarEfemerides as l, obtenerEfemeride as o };
//# sourceMappingURL=efemerides-Br_kh4fn.js.map
