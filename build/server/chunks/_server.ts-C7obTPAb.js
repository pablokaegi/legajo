import { d as db, j as jobs } from './db-C42nfPYx.js';
import { j as puedeGestionarFaltas, i as puedeGestionarAmonestaciones } from './authz-qx5pRuic.js';
import { r as registrarAccion, i as ipDe } from './audit-DIlYjN0S.js';
import { a as crearAmonestacionesBulk } from './amonestaciones-CnyVIs6e.js';
import { c as crearFalta } from './faltas-BnlkkCR-.js';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';

//#region src/routes/api/bulk/observations/+server.ts
var SYNC_THRESHOLD = 200;
var BulkFaltaSchema = z.object({
	tipo: z.literal("falta"),
	alumnos: z.array(z.object({
		alumnoMoodleId: z.number().int().positive(),
		alumnoNombre: z.string().min(1).max(200)
	})).min(1).max(1e3),
	payload: z.object({
		fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
		tipoFalta: z.enum([
			"ausente",
			"retraso",
			"salida_anticipada",
			"otra"
		]),
		descripcion: z.string().max(2e3).optional(),
		cursoMoodleId: z.number().int().positive(),
		cursoNombre: z.string().min(1).max(200),
		visibilidad: z.enum(["publica", "interna"]).default("publica")
	})
});
var BulkAmonestacionSchema = z.object({
	tipo: z.literal("amonestacion"),
	alumnos: z.array(z.object({
		alumnoMoodleId: z.number().int().positive(),
		alumnoNombre: z.string().min(1).max(200)
	})).min(1).max(1e3),
	payload: z.object({
		fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
		gravedad: z.enum([
			"leve",
			"mediana",
			"grave"
		]),
		motivo: z.string().min(1).max(3e3),
		accionesSugeridas: z.string().max(2e3).optional(),
		cursoMoodleId: z.number().int().positive().optional(),
		cursoNombre: z.string().max(200).optional()
	})
});
var BulkSchema = z.discriminatedUnion("tipo", [BulkFaltaSchema, BulkAmonestacionSchema]);
var POST = async ({ request, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: "JSON inválido" }, { status: 400 });
	}
	const parsed = BulkSchema.safeParse(body);
	if (!parsed.success) return json({
		error: "Datos inválidos",
		details: parsed.error.flatten()
	}, { status: 422 });
	const data = parsed.data;
	if (data.tipo === "falta" && !await puedeGestionarFaltas(locals.usuario.usuarioId)) return json({ error: "Sin permiso para registrar faltas" }, { status: 403 });
	if (data.tipo === "amonestacion" && !await puedeGestionarAmonestaciones(locals.usuario.usuarioId)) return json({ error: "Sin permiso para registrar amonestaciones" }, { status: 403 });
	const jobId = randomUUID();
	const total = data.alumnos.length;
	await db.insert(jobs).values({
		id: jobId,
		tipo: `bulk_${data.tipo}`,
		estado: "pendiente",
		payloadJson: JSON.stringify(data),
		usuarioId: locals.usuario.usuarioId,
		total,
		procesados: 0,
		errores: 0
	});
	if (total <= SYNC_THRESHOLD) {
		try {
			await db.update(jobs).set({ estado: "procesando" }).where(eq(jobs.id, jobId));
			if (data.tipo === "falta") await crearFalta(locals.usuario.usuarioId, {
				fecha: data.payload.fecha,
				tipo: data.payload.tipoFalta,
				descripcion: data.payload.descripcion,
				cursoMoodleId: data.payload.cursoMoodleId,
				cursoNombre: data.payload.cursoNombre,
				visibilidad: data.payload.visibilidad,
				alumnos: data.alumnos.map((a) => ({
					alumnoMoodleId: a.alumnoMoodleId,
					alumnoNombre: a.alumnoNombre
				}))
			});
			else await crearAmonestacionesBulk(locals.usuario.usuarioId, {
				alumnos: data.alumnos,
				fecha: data.payload.fecha,
				gravedad: data.payload.gravedad,
				motivo: data.payload.motivo,
				accionesSugeridas: data.payload.accionesSugeridas,
				cursoMoodleId: data.payload.cursoMoodleId,
				cursoNombre: data.payload.cursoNombre
			});
			await db.update(jobs).set({
				estado: "completado",
				procesados: total,
				resultadoJson: JSON.stringify({ ok: true })
			}).where(eq(jobs.id, jobId));
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Error desconocido";
			await db.update(jobs).set({
				estado: "error",
				errores: total,
				resultadoJson: JSON.stringify({ error: msg })
			}).where(eq(jobs.id, jobId));
		}
		await registrarAccion({
			usuarioId: locals.usuario.usuarioId,
			accion: `bulk_${data.tipo}`,
			tablaDestino: data.tipo === "falta" ? "faltas" : "amonestaciones",
			payload: { total },
			ip: ipDe(request)
		});
		return json({
			jobId,
			sincrono: true,
			total
		}, { status: 201 });
	}
	setImmediate(async () => {
		try {
			await db.update(jobs).set({ estado: "procesando" }).where(eq(jobs.id, jobId));
			let procesados = 0;
			let errores = 0;
			if (data.tipo === "falta") try {
				await crearFalta(locals.usuario.usuarioId, {
					fecha: data.payload.fecha,
					tipo: data.payload.tipoFalta,
					descripcion: data.payload.descripcion,
					cursoMoodleId: data.payload.cursoMoodleId,
					cursoNombre: data.payload.cursoNombre,
					visibilidad: data.payload.visibilidad,
					alumnos: data.alumnos.map((a) => ({
						alumnoMoodleId: a.alumnoMoodleId,
						alumnoNombre: a.alumnoNombre
					}))
				});
				procesados = total;
			} catch {
				errores = total;
			}
			else for (const alumno of data.alumnos) {
				try {
					await crearAmonestacionesBulk(locals.usuario.usuarioId, {
						alumnos: [alumno],
						fecha: data.payload.fecha,
						gravedad: data.payload.gravedad,
						motivo: data.payload.motivo,
						accionesSugeridas: data.payload.accionesSugeridas,
						cursoMoodleId: data.payload.cursoMoodleId,
						cursoNombre: data.payload.cursoNombre
					});
					procesados++;
				} catch {
					errores++;
				}
				await db.update(jobs).set({
					procesados,
					errores
				}).where(eq(jobs.id, jobId));
			}
			await db.update(jobs).set({
				estado: errores === total ? "error" : "completado",
				procesados,
				errores
			}).where(eq(jobs.id, jobId));
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Error";
			await db.update(jobs).set({
				estado: "error",
				resultadoJson: JSON.stringify({ error: msg })
			}).where(eq(jobs.id, jobId));
		}
	});
	return json({
		jobId,
		sincrono: false,
		total
	}, { status: 202 });
};

export { POST };
//# sourceMappingURL=_server.ts-C7obTPAb.js.map
