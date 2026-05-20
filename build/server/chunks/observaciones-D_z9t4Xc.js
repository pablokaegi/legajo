import { o as observaciones, d as db } from './db-C42nfPYx.js';
import { eq, like, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

//#region src/lib/server/services/observaciones.ts
var ObservacionSchema = z.object({
	alumnoMoodleId: z.number().int().positive(),
	alumnoNombre: z.string().min(1).max(200),
	cursoMoodleId: z.number().int().positive(),
	cursoNombre: z.string().min(1).max(200),
	actitud: z.number().int().min(1).max(5).optional().nullable(),
	tareaCompleta: z.boolean().optional().nullable(),
	participacion: z.number().int().min(1).max(5).optional().nullable(),
	observacionTexto: z.string().max(500).optional().nullable(),
	fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha invalido (YYYY-MM-DD)").refine((val) => !isNaN(Date.parse(val)), "Fecha invalida")
});
var ObservacionBaseSchema = ObservacionSchema.omit({
	alumnoMoodleId: true,
	alumnoNombre: true
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
async function crearObservacionesBulk(usuarioId, alumnos, base) {
	if (alumnos.length === 0) return 0;
	const validatedBase = ObservacionBaseSchema.parse(base);
	const rows = alumnos.map((a) => ({
		usuarioId,
		alumnoMoodleId: a.alumnoMoodleId,
		alumnoNombre: a.alumnoNombre,
		...validatedBase
	}));
	await db.insert(observaciones).values(rows);
	return rows.length;
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

export { ObservacionBaseSchema as O, ObservacionSchema as a, crearObservacion as b, crearObservacionesBulk as c, obtenerHistorialFiltrado as o };
//# sourceMappingURL=observaciones-D_z9t4Xc.js.map
