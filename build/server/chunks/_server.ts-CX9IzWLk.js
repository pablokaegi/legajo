import { d as db, D as jobs } from './db-CLN6I8p_.js';
import { k as puedeGestionarPreceptoriaCurso } from './authz-BVdVv-6k.js';
import { r as registrarAccion, i as ipDe } from './audit-Dz9I-BN1.js';
import { a as crearAmonestacionesBulk } from './amonestaciones-C_Z8PIPM.js';
import { v as verificarAlumnosDelCurso } from './cursos2-pDrqIz-A.js';
import { c as crearFalta } from './faltas-Ca0YAQ6-.js';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './client-Dsrb4zGp.js';
import './rest-qugARKMk.js';

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
		cursoMoodleId: z.number().int().positive(),
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
	if (!await puedeGestionarPreceptoriaCurso(locals.usuario.usuarioId, data.payload.cursoMoodleId)) return json({ error: "No tenés permisos de preceptoría para este curso." }, { status: 403 });
	let padron;
	try {
		padron = await verificarAlumnosDelCurso(data.payload.cursoMoodleId, data.alumnos.map((a) => a.alumnoMoodleId));
	} catch {
		return json({ error: "No se pudo verificar la matrícula en Moodle." }, { status: 503 });
	}
	if (!padron) return json({ error: "Algún alumno no pertenece al curso." }, { status: 400 });
	data.alumnos = padron.alumnos;
	data.payload.cursoNombre = padron.cursoNombre;
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
				estado: "registrada",
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
					estado: "registrada",
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
//# sourceMappingURL=_server.ts-CX9IzWLk.js.map
