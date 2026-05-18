import { o as observaciones, d as db } from './db-D9cZesji.js';
import { eq, like, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

//#region src/lib/server/services/observaciones.ts
var ObservacionSchema = z.object({
	alumnoMoodleId: z.number().int().positive(),
	alumnoNombre: z.string().min(1).max(200),
	cursoMoodleId: z.number().int().positive(),
	cursoNombre: z.string().min(1).max(200),
	actitud: z.number().int().min(1).max(5),
	tareaCompleta: z.boolean(),
	participacion: z.number().int().min(1).max(5),
	observacionTexto: z.string().max(500).optional().nullable(),
	fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha invalido (YYYY-MM-DD)").refine((val) => !isNaN(Date.parse(val)), "Fecha invalida")
});
function escapeLike(s) {
	return s.replace(/[\\%_]/g, "\\$&");
}
async function crearObservacion(usuarioId, input) {
	const validated = ObservacionSchema.parse(input);
	const result = await db.insert(observaciones).values({
		usuarioId,
		...validated
	});
	return Number(result[0].insertId);
}
async function obtenerHistorialFiltrado(opts) {
	const { limit = 20, offset = 0 } = opts;
	const conditions = [];
	if (!opts.omitUsuarioFilter) conditions.push(eq(observaciones.usuarioId, opts.usuarioId));
	if (opts.alumno) conditions.push(like(observaciones.alumnoNombre, `%${escapeLike(opts.alumno)}%`));
	if (opts.curso) conditions.push(like(observaciones.cursoNombre, `%${escapeLike(opts.curso)}%`));
	const where = conditions.length > 0 ? and(...conditions) : void 0;
	const [rows, totalResult] = await Promise.all([db.select().from(observaciones).where(where).orderBy(desc(observaciones.fecha)).limit(limit).offset(offset), db.select({ count: sql`count(*)` }).from(observaciones).where(where)]);
	return {
		observaciones: rows,
		total: Number(totalResult[0]?.count ?? 0)
	};
}

export { ObservacionSchema as O, crearObservacion as c, obtenerHistorialFiltrado as o };
//# sourceMappingURL=observaciones-t8-khaPX.js.map
