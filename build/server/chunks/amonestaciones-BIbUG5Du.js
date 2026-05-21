import { q as amonestaciones, d as db } from './db-Baevsgh0.js';
import { eq, like, desc, and } from 'drizzle-orm';
import { z } from 'zod';

//#region src/lib/server/services/amonestaciones.ts
var NuevaAmonestacionSchema = z.object({
	alumnoMoodleId: z.number().int().positive(),
	alumnoNombre: z.string().min(1).max(200),
	fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((f) => f <= (/* @__PURE__ */ new Date()).toISOString().split("T")[0], "La fecha no puede ser futura"),
	gravedad: z.enum([
		"leve",
		"mediana",
		"grave"
	]),
	motivo: z.string().min(1, "El motivo es requerido").max(3e3),
	accionesSugeridas: z.string().max(2e3).optional(),
	cursoMoodleId: z.number().int().positive().optional(),
	cursoNombre: z.string().max(200).optional()
});
z.object({
	alumnos: z.array(z.object({
		alumnoMoodleId: z.number().int().positive(),
		alumnoNombre: z.string().min(1).max(200)
	})).min(1).max(500),
	fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((f) => f <= (/* @__PURE__ */ new Date()).toISOString().split("T")[0], "La fecha no puede ser futura"),
	gravedad: z.enum([
		"leve",
		"mediana",
		"grave"
	]),
	motivo: z.string().min(1).max(3e3),
	accionesSugeridas: z.string().max(2e3).optional(),
	cursoMoodleId: z.number().int().positive().optional(),
	cursoNombre: z.string().max(200).optional()
});
async function crearAmonestacion(preceptorId, data) {
	const [result] = await db.insert(amonestaciones).values({
		alumnoMoodleId: data.alumnoMoodleId,
		alumnoNombre: data.alumnoNombre,
		fecha: data.fecha,
		gravedad: data.gravedad,
		motivo: data.motivo,
		preceptorId,
		accionesSugeridas: data.accionesSugeridas ?? null,
		cursoMoodleId: data.cursoMoodleId ?? null,
		cursoNombre: data.cursoNombre ?? null
	});
	return result.insertId;
}
async function crearAmonestacionesBulk(preceptorId, data) {
	const ids = [];
	for (const alumno of data.alumnos) {
		const id = await crearAmonestacion(preceptorId, {
			alumnoMoodleId: alumno.alumnoMoodleId,
			alumnoNombre: alumno.alumnoNombre,
			fecha: data.fecha,
			gravedad: data.gravedad,
			motivo: data.motivo,
			accionesSugeridas: data.accionesSugeridas,
			cursoMoodleId: data.cursoMoodleId,
			cursoNombre: data.cursoNombre
		});
		ids.push(id);
	}
	return ids;
}
async function listarAmonestaciones(filtros) {
	const page = Math.max(1, filtros.page ?? 1);
	const limit = Math.min(100, filtros.limit ?? 20);
	const offset = (page - 1) * limit;
	const conditions = [];
	if (filtros.preceptorId) conditions.push(eq(amonestaciones.preceptorId, filtros.preceptorId));
	if (filtros.alumnoMoodleId) conditions.push(eq(amonestaciones.alumnoMoodleId, filtros.alumnoMoodleId));
	if (filtros.alumnoQ) conditions.push(like(amonestaciones.alumnoNombre, `%${filtros.alumnoQ}%`));
	if (filtros.cursoQ) conditions.push(like(amonestaciones.cursoNombre, `%${filtros.cursoQ}%`));
	if (filtros.gravedad) conditions.push(eq(amonestaciones.gravedad, filtros.gravedad));
	let query = db.select().from(amonestaciones).orderBy(desc(amonestaciones.fecha), desc(amonestaciones.createdAt)).limit(limit).offset(offset);
	if (conditions.length > 0) query = query.where(and(...conditions));
	return await query;
}

export { NuevaAmonestacionSchema as N, crearAmonestacionesBulk as a, crearAmonestacion as c, listarAmonestaciones as l };
//# sourceMappingURL=amonestaciones-BIbUG5Du.js.map
