import { r as registrarAccion, i as ipDe } from './audit--5ksYK0e.js';
import { l as listarCursos, a as listarAlumnosDeCurso } from './cursos2-CxacCokc.js';
import { N as NuevaReincorporacionSchema, c as crearReincorporacion } from './reincorporaciones-BVgELznS.js';
import { redirect, fail } from '@sveltejs/kit';
import './db-BEC8cTGI.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './client-BrmXZkzW.js';
import 'drizzle-orm';
import 'zod';

//#region src/routes/preceptor/reincorporaciones/nueva/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const cursos = await listarCursos().catch(() => []);
	const cursoIdParam = url.searchParams.get("cursoId");
	const alumnoIdParam = url.searchParams.get("alumnoId");
	const alumnosParam = url.searchParams.get("alumnos");
	if (cursoIdParam && alumnosParam) {
		const cursoId = parseInt(cursoIdParam, 10);
		const alumnoIds = new Set(alumnosParam.split(",").map(Number).filter((n) => !isNaN(n) && n > 0));
		if (!isNaN(cursoId) && alumnoIds.size > 0) {
			const found = (await listarAlumnosDeCurso(cursoId).catch(() => [])).filter((a) => alumnoIds.has(a.id));
			return {
				cursos,
				preselect: {
					cursoId,
					cursoNombre: cursos.find((c) => c.id === cursoId)?.displayname ?? cursos.find((c) => c.id === cursoId)?.fullname ?? `Curso ${cursoId}`,
					alumnos: found.map((a) => ({
						id: a.id,
						fullname: a.fullname
					}))
				}
			};
		}
	}
	return {
		cursos,
		preselect: {
			cursoId: cursoIdParam ? parseInt(cursoIdParam, 10) : null,
			alumnoId: alumnoIdParam ? parseInt(alumnoIdParam, 10) : null,
			alumnoNombre: url.searchParams.get("alumnoNombre") ?? null,
			cursoNombre: null,
			alumnos: null
		}
	};
};
var actions = { default: async ({ request, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const form = await request.formData();
	let alumnos = [];
	try {
		const raw = String(form.get("alumnos") ?? "[]");
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed) || parsed.length === 0) return fail(400, { error: "Debe seleccionar al menos un alumno" });
		alumnos = parsed.map((a) => ({
			alumnoMoodleId: Number(a.alumnoMoodleId),
			alumnoNombre: String(a.alumnoNombre ?? "")
		})).filter((a) => a.alumnoMoodleId > 0 && a.alumnoNombre.length > 0);
	} catch {
		return fail(400, { error: "Datos de alumnos inválidos" });
	}
	if (alumnos.length === 0) return fail(400, { error: "Debe seleccionar al menos un alumno" });
	const base = {
		fechaReincorporacion: String(form.get("fechaReincorporacion") ?? ""),
		observaciones: String(form.get("observaciones") ?? "").trim() || void 0,
		documentoUrl: String(form.get("documentoUrl") ?? "").trim() || void 0,
		linkedFaltaId: form.get("linkedFaltaId") ? parseInt(String(form.get("linkedFaltaId")), 10) : void 0
	};
	const first = alumnos[0];
	const parsed = NuevaReincorporacionSchema.safeParse({
		...base,
		...first
	});
	if (!parsed.success) {
		const errors = parsed.error.flatten().fieldErrors;
		return fail(400, { error: Object.values(errors).flat()[0] ?? "Datos inválidos" });
	}
	try {
		for (const alumno of alumnos) {
			const id = await crearReincorporacion(locals.usuario.usuarioId, {
				...base,
				alumnoMoodleId: alumno.alumnoMoodleId,
				alumnoNombre: alumno.alumnoNombre,
				fechaReincorporacion: base.fechaReincorporacion
			});
			await registrarAccion({
				usuarioId: locals.usuario.usuarioId,
				accion: "crear_reincorporacion",
				tablaDestino: "reincorporaciones",
				idDestino: id,
				ip: ipDe(request)
			});
		}
	} catch (err) {
		return fail(500, { error: err instanceof Error ? err.message : "Error al guardar" });
	}
	throw redirect(303, `/preceptor/reincorporaciones?guardado=${alumnos.length}`);
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 36;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CLEnmAy-.js')).default;
const server_id = "src/routes/preceptor/reincorporaciones/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/36.DgHzbE0T.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/CEmSAoB3.js","_app/immutable/chunks/CxYS42Kd.js","_app/immutable/chunks/DBLIlT8e.js","_app/immutable/chunks/BEDIq91W.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=36-DmiZ5iFy.js.map
