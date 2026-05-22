import { d as db, b as salidasAutorizaciones, f as salidas } from './db-BEC8cTGI.js';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

//#region src/lib/server/services/salidas.ts
async function listarSalidas(filtros = {}) {
	const page = Math.max(1, filtros.page ?? 1);
	const limit = 30;
	const offset = (page - 1) * limit;
	let q = db.select().from(salidas).orderBy(desc(salidas.fecha), desc(salidas.createdAt)).limit(limit).offset(offset);
	if (filtros.estado) q = q.where(eq(salidas.estado, filtros.estado));
	return await q;
}
async function obtenerSalida(id) {
	const [row] = await db.select().from(salidas).where(eq(salidas.id, id)).limit(1);
	return row ?? null;
}
async function crearSalida(createdBy, data) {
	const uploadToken = randomUUID();
	const [result] = await db.insert(salidas).values({
		titulo: data.titulo,
		fecha: data.fecha,
		destino: data.destino,
		descripcion: data.descripcion ?? null,
		responsableNombre: data.responsableNombre,
		cursoNombre: data.cursoNombre,
		cantidadAlumnos: data.cantidadAlumnos ?? null,
		costoEstimado: data.costoEstimado ?? null,
		estado: "borrador",
		uploadToken,
		notas: data.notas ?? null,
		createdBy
	});
	return {
		id: result.insertId,
		uploadToken
	};
}
async function crearAutorizacionesDeSalida(salidaId, alumnos) {
	const values = alumnos.map((a) => ({
		salidaId,
		alumnoMoodleId: a.alumnoMoodleId,
		alumnoNombre: a.alumnoNombre,
		uploadToken: randomUUID()
	}));
	if (values.length === 0) return 0;
	for (const v of values) try {
		await db.insert(salidasAutorizaciones).values(v);
	} catch {}
	return values.length;
}
async function listarAutorizacionesDeSalida(salidaId) {
	return db.select().from(salidasAutorizaciones).where(eq(salidasAutorizaciones.salidaId, salidaId)).orderBy(salidasAutorizaciones.alumnoNombre);
}
async function obtenerAutorizacionPorToken(token) {
	const [row] = await db.select().from(salidasAutorizaciones).where(eq(salidasAutorizaciones.uploadToken, token)).limit(1);
	if (!row) return null;
	const salida = await obtenerSalida(row.salidaId);
	return salida ? {
		...row,
		salida
	} : null;
}
async function marcarAutorizacionSubida(id, documentoPath, documentoNombre) {
	await db.update(salidasAutorizaciones).set({
		documentoPath,
		documentoNombre,
		documentoSubidoAt: /* @__PURE__ */ new Date()
	}).where(eq(salidasAutorizaciones.id, id));
}
async function editarSalida(id, data) {
	await db.update(salidas).set({
		...data,
		updatedAt: /* @__PURE__ */ new Date()
	}).where(eq(salidas.id, id));
}

export { crearAutorizacionesDeSalida as a, obtenerSalida as b, crearSalida as c, listarAutorizacionesDeSalida as d, editarSalida as e, listarSalidas as l, marcarAutorizacionSubida as m, obtenerAutorizacionPorToken as o };
//# sourceMappingURL=salidas-B0duh-lC.js.map
