import { d as db, b as salidas } from './db-Dn_D9nFJ.js';
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
async function obtenerSalidaPorToken(token) {
	const [row] = await db.select().from(salidas).where(eq(salidas.uploadToken, token)).limit(1);
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
async function editarSalida(id, data) {
	await db.update(salidas).set({
		...data,
		updatedAt: /* @__PURE__ */ new Date()
	}).where(eq(salidas.id, id));
}

export { obtenerSalida as a, crearSalida as c, editarSalida as e, listarSalidas as l, obtenerSalidaPorToken as o };
//# sourceMappingURL=salidas-59g_ONvI.js.map
