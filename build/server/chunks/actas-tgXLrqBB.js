import { d as db, k as actas, l as actasAsistentes, m as actasAlumnos, n as actasTareas, p as actasVersiones } from './db-BEC8cTGI.js';
import { desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

//#region src/lib/server/services/actas.ts
var TareaSchema = z.object({
	descripcion: z.string().min(1).max(2e3),
	responsableId: z.number().int().positive().optional(),
	dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});
var AsistenteSchema = z.object({
	usuarioId: z.number().int().positive(),
	rol: z.string().max(32).optional()
});
var AlumnoActaSchema = z.object({
	alumnoMoodleId: z.number().int().positive(),
	alumnoNombre: z.string().min(1).max(200)
});
var NuevaActaSchema = z.object({
	fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
	titulo: z.string().min(1, "El título es requerido").max(300),
	resumen: z.string().min(1, "El resumen es requerido").max(1e4),
	acuerdos: z.string().max(1e4).optional(),
	asistentes: z.array(AsistenteSchema).max(50).optional().default([]),
	alumnos: z.array(AlumnoActaSchema).max(200).optional().default([]),
	tareas: z.array(TareaSchema).max(50).optional().default([])
});
var EditarActaSchema = z.object({
	titulo: z.string().min(1).max(300).optional(),
	resumen: z.string().min(1).max(1e4).optional(),
	acuerdos: z.string().max(1e4).optional(),
	estado: z.enum(["abierta", "cerrada"]).optional(),
	tareas: z.array(TareaSchema.extend({
		id: z.number().int().positive().optional(),
		estado: z.enum([
			"pendiente",
			"en_progreso",
			"completada"
		]).optional()
	})).max(50).optional()
});
async function crearActa(createdBy, data) {
	return await db.transaction(async (tx) => {
		const [result] = await tx.insert(actas).values({
			fecha: data.fecha,
			titulo: data.titulo,
			resumen: data.resumen,
			acuerdos: data.acuerdos ?? null,
			estado: "abierta",
			createdBy
		});
		const actaId = result.insertId;
		if (data.asistentes.length > 0) await tx.insert(actasAsistentes).values(data.asistentes.map((a) => ({
			actaId,
			usuarioId: a.usuarioId,
			rol: a.rol ?? null
		})));
		if (data.alumnos.length > 0) await tx.insert(actasAlumnos).values(data.alumnos.map((a) => ({
			actaId,
			alumnoMoodleId: a.alumnoMoodleId,
			alumnoNombre: a.alumnoNombre
		})));
		if (data.tareas.length > 0) await tx.insert(actasTareas).values(data.tareas.map((t) => ({
			actaId,
			descripcion: t.descripcion,
			responsableId: t.responsableId ?? null,
			dueDate: t.dueDate ?? null,
			estado: "pendiente"
		})));
		return actaId;
	});
}
async function editarActa(actaId, editadoPor, data) {
	await db.transaction(async (tx) => {
		const [actual] = await tx.select().from(actas).where(eq(actas.id, actaId)).limit(1);
		if (!actual) throw new Error("Acta no encontrada");
		await tx.insert(actasVersiones).values({
			actaId,
			resumen: actual.resumen,
			acuerdos: actual.acuerdos ?? null,
			editadoPor
		});
		const updates = {};
		if (data.titulo !== void 0) updates.titulo = data.titulo;
		if (data.resumen !== void 0) updates.resumen = data.resumen;
		if (data.acuerdos !== void 0) updates.acuerdos = data.acuerdos;
		if (data.estado !== void 0) updates.estado = data.estado;
		if (Object.keys(updates).length > 0) await tx.update(actas).set(updates).where(eq(actas.id, actaId));
		if (data.tareas) for (const tarea of data.tareas) if (tarea.id) await tx.update(actasTareas).set({
			descripcion: tarea.descripcion,
			responsableId: tarea.responsableId ?? null,
			dueDate: tarea.dueDate ?? null,
			estado: tarea.estado ?? "pendiente"
		}).where(eq(actasTareas.id, tarea.id));
		else await tx.insert(actasTareas).values({
			actaId,
			descripcion: tarea.descripcion,
			responsableId: tarea.responsableId ?? null,
			dueDate: tarea.dueDate ?? null,
			estado: tarea.estado ?? "pendiente"
		});
	});
}
async function obtenerActaCompleta(id) {
	const [acta] = await db.select().from(actas).where(eq(actas.id, id)).limit(1);
	if (!acta) return null;
	const [asistentes, alumnos, tareas, versiones] = await Promise.all([
		db.select().from(actasAsistentes).where(eq(actasAsistentes.actaId, id)),
		db.select().from(actasAlumnos).where(eq(actasAlumnos.actaId, id)),
		db.select().from(actasTareas).where(eq(actasTareas.actaId, id)),
		db.select().from(actasVersiones).where(eq(actasVersiones.actaId, id)).orderBy(desc(actasVersiones.createdAt)).limit(20)
	]);
	return {
		...acta,
		asistentes,
		alumnos,
		tareas,
		versiones
	};
}
async function listarActas(filtros) {
	const page = Math.max(1, filtros.page ?? 1);
	const limit = Math.min(50, filtros.limit ?? 20);
	const offset = (page - 1) * limit;
	let query = db.select().from(actas).orderBy(desc(actas.fecha), desc(actas.createdAt)).limit(limit).offset(offset);
	if (filtros.estado) query = query.where(eq(actas.estado, filtros.estado));
	return await query;
}
/** Lista actas incluyendo los alumnos involucrados (para filtrado client-side). */
async function listarActasConAlumnos(filtros) {
	const rows = await listarActas(filtros);
	if (rows.length === 0) return [];
	const ids = rows.map((a) => a.id);
	const todosAlumnos = await db.select().from(actasAlumnos).where(inArray(actasAlumnos.actaId, ids));
	const porActa = /* @__PURE__ */ new Map();
	for (const a of todosAlumnos) {
		if (!porActa.has(a.actaId)) porActa.set(a.actaId, []);
		porActa.get(a.actaId).push(a);
	}
	return rows.map((a) => ({
		...a,
		alumnos: porActa.get(a.id) ?? []
	}));
}

export { EditarActaSchema as E, NuevaActaSchema as N, listarActasConAlumnos as a, crearActa as c, editarActa as e, listarActas as l, obtenerActaCompleta as o };
//# sourceMappingURL=actas-tgXLrqBB.js.map
