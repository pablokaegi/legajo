import { d as db, x as faltas, f as faltasAlumnos } from './db-BwwlYHWL.js';
import { eq, like, inArray, desc, and } from 'drizzle-orm';
import { z } from 'zod';

//#region src/lib/server/services/faltas.ts
var AlumnoFaltaSchema = z.object({
	alumnoMoodleId: z.number().int().positive(),
	alumnoNombre: z.string().min(1).max(200),
	nota: z.string().max(1e3).optional()
});
var NuevaFaltaSchema = z.object({
	fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)").refine((f) => f <= (/* @__PURE__ */ new Date()).toISOString().split("T")[0], "La fecha no puede ser futura"),
	tipo: z.enum([
		"ausente",
		"retraso",
		"salida_anticipada",
		"otra"
	]),
	descripcion: z.string().max(2e3).optional(),
	cursoMoodleId: z.number().int().positive(),
	cursoNombre: z.string().min(1).max(200),
	alumnos: z.array(AlumnoFaltaSchema).min(1, "Seleccioná al menos un alumno").max(500),
	estado: z.enum(["registrada", "confirmada"]).default("registrada"),
	visibilidad: z.enum(["publica", "interna"]).default("publica")
});
async function crearFalta(preceptorId, data) {
	return await db.transaction(async (tx) => {
		const [result] = await tx.insert(faltas).values({
			fecha: data.fecha,
			tipo: data.tipo,
			descripcion: data.descripcion ?? null,
			preceptorId,
			cursoMoodleId: data.cursoMoodleId,
			cursoNombre: data.cursoNombre,
			estado: data.estado,
			visibilidad: data.visibilidad
		});
		const faltaId = result.insertId;
		await tx.insert(faltasAlumnos).values(data.alumnos.map((a) => ({
			faltaId,
			alumnoMoodleId: a.alumnoMoodleId,
			alumnoNombre: a.alumnoNombre,
			nota: a.nota ?? null
		})));
		return faltaId;
	});
}
async function listarFaltas(filtros) {
	const page = Math.max(1, filtros.page ?? 1);
	const limit = Math.min(100, filtros.limit ?? 20);
	const offset = (page - 1) * limit;
	const conditions = [];
	if (filtros.preceptorId) conditions.push(eq(faltas.preceptorId, filtros.preceptorId));
	if (filtros.cursoMoodleId) conditions.push(eq(faltas.cursoMoodleId, filtros.cursoMoodleId));
	if (filtros.cursoQ) conditions.push(like(faltas.cursoNombre, `%${filtros.cursoQ}%`));
	if (filtros.alumnoQ) {
		const ids = (await db.selectDistinct({ faltaId: faltasAlumnos.faltaId }).from(faltasAlumnos).where(like(faltasAlumnos.alumnoNombre, `%${filtros.alumnoQ}%`))).map((r) => r.faltaId);
		if (ids.length === 0) return [];
		conditions.push(inArray(faltas.id, ids));
	}
	let query = db.select().from(faltas).orderBy(desc(faltas.fecha), desc(faltas.createdAt)).limit(limit).offset(offset);
	if (conditions.length > 0) query = query.where(and(...conditions));
	const rows = await query;
	if (filtros.alumnoMoodleId) {
		const alumnoFaltas = await db.select({ faltaId: faltasAlumnos.faltaId }).from(faltasAlumnos).where(eq(faltasAlumnos.alumnoMoodleId, filtros.alumnoMoodleId));
		const ids = new Set(alumnoFaltas.map((f) => f.faltaId));
		return rows.filter((r) => ids.has(r.id));
	}
	return rows;
}
async function listarFaltasConAlumnos(filtros) {
	const rows = await listarFaltas(filtros);
	if (rows.length === 0) return [];
	const ids = rows.map((f) => f.id);
	const todosAlumnos = await db.select().from(faltasAlumnos).where(inArray(faltasAlumnos.faltaId, ids));
	const porFalta = /* @__PURE__ */ new Map();
	for (const a of todosAlumnos) {
		if (!porFalta.has(a.faltaId)) porFalta.set(a.faltaId, []);
		porFalta.get(a.faltaId).push(a);
	}
	return rows.map((f) => ({
		...f,
		alumnos: porFalta.get(f.id) ?? []
	}));
}

export { NuevaFaltaSchema as N, listarFaltasConAlumnos as a, crearFalta as c, listarFaltas as l };
//# sourceMappingURL=faltas-DuKbQgLX.js.map
