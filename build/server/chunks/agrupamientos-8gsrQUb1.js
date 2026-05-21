import { d as db, a as agrupamientoSesiones, b as agrupamientoVotos } from './db-Baevsgh0.js';
import { desc, eq, and } from 'drizzle-orm';

//#region src/lib/server/services/agrupamientos.ts
async function listarSesiones(filtros = {}) {
	let q = db.select().from(agrupamientoSesiones).orderBy(desc(agrupamientoSesiones.fecha), desc(agrupamientoSesiones.createdAt));
	if (filtros.estado) q = q.where(eq(agrupamientoSesiones.estado, filtros.estado));
	const sesiones = await q;
	const result = [];
	for (const s of sesiones) {
		const votos = await db.select({ id: agrupamientoVotos.id }).from(agrupamientoVotos).where(eq(agrupamientoVotos.sesionId, s.id));
		result.push({
			...s,
			cantidadVotos: votos.length
		});
	}
	return result;
}
async function obtenerSesion(id) {
	const [row] = await db.select().from(agrupamientoSesiones).where(eq(agrupamientoSesiones.id, id)).limit(1);
	return row ?? null;
}
async function crearSesion(createdBy, data) {
	const [result] = await db.insert(agrupamientoSesiones).values({
		cursoMoodleId: data.cursoMoodleId,
		cursoNombre: data.cursoNombre,
		titulo: data.titulo,
		fecha: data.fecha,
		estado: "abierta",
		notas: data.notas ?? null,
		createdBy
	});
	return result.insertId;
}
async function editarSesion(id, data) {
	await db.update(agrupamientoSesiones).set({
		...data,
		updatedAt: /* @__PURE__ */ new Date()
	}).where(eq(agrupamientoSesiones.id, id));
}
async function eliminarSesion(id) {
	await db.delete(agrupamientoSesiones).where(eq(agrupamientoSesiones.id, id));
}
function parseCalificaciones(raw) {
	try {
		const arr = JSON.parse(raw);
		if (!Array.isArray(arr)) return [];
		return arr.map((c) => ({
			id: Number(c.id),
			nombre: String(c.nombre ?? ""),
			puntaje: Number(c.puntaje)
		})).filter((c) => c.id > 0 && c.puntaje >= 1 && c.puntaje <= 5);
	} catch {
		return [];
	}
}
async function listarVotos(sesionId) {
	return (await db.select().from(agrupamientoVotos).where(eq(agrupamientoVotos.sesionId, sesionId)).orderBy(agrupamientoVotos.votanteNombre)).map((r) => ({
		id: r.id,
		votanteMoodleId: r.votanteMoodleId,
		votanteNombre: r.votanteNombre,
		calificaciones: parseCalificaciones(r.calificaciones),
		bloqueadoMoodleId: r.bloqueadoMoodleId,
		bloqueadoNombre: r.bloqueadoNombre
	}));
}
/** Inserta o actualiza el voto de un alumno (upsert por sesión + votante). */
async function guardarVoto(sesionId, voto) {
	const calificacionesJson = JSON.stringify(voto.calificaciones);
	const [existente] = await db.select({ id: agrupamientoVotos.id }).from(agrupamientoVotos).where(and(eq(agrupamientoVotos.sesionId, sesionId), eq(agrupamientoVotos.votanteMoodleId, voto.votanteMoodleId))).limit(1);
	if (existente) {
		await db.update(agrupamientoVotos).set({
			votanteNombre: voto.votanteNombre,
			calificaciones: calificacionesJson,
			bloqueadoMoodleId: voto.bloqueadoMoodleId ?? null,
			bloqueadoNombre: voto.bloqueadoNombre ?? null,
			updatedAt: /* @__PURE__ */ new Date()
		}).where(eq(agrupamientoVotos.id, existente.id));
		return existente.id;
	}
	const [result] = await db.insert(agrupamientoVotos).values({
		sesionId,
		votanteMoodleId: voto.votanteMoodleId,
		votanteNombre: voto.votanteNombre,
		calificaciones: calificacionesJson,
		bloqueadoMoodleId: voto.bloqueadoMoodleId ?? null,
		bloqueadoNombre: voto.bloqueadoNombre ?? null
	});
	return result.insertId;
}
async function eliminarVoto(votoId) {
	await db.delete(agrupamientoVotos).where(eq(agrupamientoVotos.id, votoId));
}

export { editarSesion as a, eliminarVoto as b, crearSesion as c, listarVotos as d, eliminarSesion as e, guardarVoto as g, listarSesiones as l, obtenerSesion as o };
//# sourceMappingURL=agrupamientos-8gsrQUb1.js.map
