import { d as db, p as reincorporaciones } from './db-CcRogbU_.js';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

//#region src/lib/server/services/reincorporaciones.ts
var NuevaReincorporacionSchema = z.object({
	alumnoMoodleId: z.number().int().positive(),
	alumnoNombre: z.string().min(1).max(200),
	fechaReincorporacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
	observaciones: z.string().max(3e3).optional(),
	documentoUrl: z.string().url("URL inválida").max(500).optional(),
	linkedFaltaId: z.number().int().positive().optional()
});
async function crearReincorporacion(preceptorId, data) {
	const [result] = await db.insert(reincorporaciones).values({
		alumnoMoodleId: data.alumnoMoodleId,
		alumnoNombre: data.alumnoNombre,
		fechaReincorporacion: data.fechaReincorporacion,
		preceptorId,
		observaciones: data.observaciones ?? null,
		documentoUrl: data.documentoUrl ?? null,
		linkedFaltaId: data.linkedFaltaId ?? null
	});
	return result.insertId;
}
async function listarReincorporaciones(filtros) {
	const page = Math.max(1, filtros.page ?? 1);
	const limit = Math.min(100, filtros.limit ?? 20);
	const offset = (page - 1) * limit;
	let query = db.select().from(reincorporaciones).orderBy(desc(reincorporaciones.fechaReincorporacion)).limit(limit).offset(offset);
	if (filtros.preceptorId) query = query.where(eq(reincorporaciones.preceptorId, filtros.preceptorId));
	else if (filtros.alumnoMoodleId) query = query.where(eq(reincorporaciones.alumnoMoodleId, filtros.alumnoMoodleId));
	return await query;
}

export { NuevaReincorporacionSchema as N, crearReincorporacion as c, listarReincorporaciones as l };
//# sourceMappingURL=reincorporaciones-DoDuFpUv.js.map
