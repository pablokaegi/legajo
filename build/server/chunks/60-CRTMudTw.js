import { k as puedeGestionarPreceptoriaCurso, j as alcancePreceptoria } from './authz-BVdVv-6k.js';
import { r as registrarAccion, i as ipDe } from './audit-Dz9I-BN1.js';
import { v as verificarAlumnosDelCurso, l as listarCursosPreceptoria, b as listarAlumnosDeCurso } from './cursos2-pDrqIz-A.js';
import { N as NuevaFaltaSchema, c as crearFalta } from './faltas-Ca0YAQ6-.js';
import { redirect, fail } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './client-Dsrb4zGp.js';
import './rest-qugARKMk.js';
import 'zod';

//#region src/routes/preceptor/faltas/nueva/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const permitidos = await alcancePreceptoria(locals.usuario.usuarioId);
	const cursos = (await listarCursosPreceptoria().catch(() => [])).filter((curso) => !permitidos || permitidos.includes(curso.id));
	const cursoIdParam = url.searchParams.get("cursoId");
	const alumnosParam = url.searchParams.get("alumnos");
	let preselect = null;
	if (cursoIdParam && alumnosParam) {
		const cursoId = parseInt(cursoIdParam, 10);
		const alumnoIds = new Set(alumnosParam.split(",").map(Number).filter((n) => !isNaN(n) && n > 0));
		if (cursos.some((c) => c.id === cursoId) && alumnoIds.size > 0) {
			const found = (await listarAlumnosDeCurso(cursoId).catch(() => [])).filter((a) => alumnoIds.has(a.id));
			preselect = {
				cursoId,
				cursoNombre: cursos.find((c) => c.id === cursoId)?.displayname ?? cursos.find((c) => c.id === cursoId)?.fullname ?? `Curso ${cursoId}`,
				alumnos: found.map((a) => ({
					id: a.id,
					fullname: a.fullname
				}))
			};
		}
	}
	return {
		cursos,
		preselect
	};
};
var actions = { default: async ({ request, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const form = await request.formData();
	const alumnosRaw = form.get("alumnos")?.toString() ?? "[]";
	let alumnos = [];
	try {
		alumnos = JSON.parse(alumnosRaw);
	} catch {
		return fail(400, { error: "Datos de alumnos inválidos" });
	}
	const input = {
		fecha: form.get("fecha")?.toString() ?? "",
		tipo: form.get("tipo")?.toString() ?? "",
		descripcion: form.get("descripcion")?.toString() || void 0,
		cursoMoodleId: parseInt(form.get("cursoMoodleId")?.toString() ?? "0", 10),
		cursoNombre: form.get("cursoNombre")?.toString() ?? "",
		visibilidad: form.get("visibilidad")?.toString() || "publica",
		alumnos
	};
	const parsed = NuevaFaltaSchema.safeParse(input);
	if (!parsed.success) return fail(422, {
		error: "Datos inválidos",
		details: parsed.error.flatten()
	});
	if (!await puedeGestionarPreceptoriaCurso(locals.usuario.usuarioId, parsed.data.cursoMoodleId)) return fail(403, { error: "No tenés permisos de preceptoría para este curso." });
	let padron;
	try {
		padron = await verificarAlumnosDelCurso(parsed.data.cursoMoodleId, parsed.data.alumnos.map((a) => a.alumnoMoodleId));
	} catch {
		return fail(503, { error: "No se pudo verificar la matrícula en Moodle." });
	}
	if (!padron) return fail(400, { error: "Algún alumno no pertenece al curso." });
	try {
		const notas = new Map(parsed.data.alumnos.map((a) => [a.alumnoMoodleId, a.nota]));
		const id = await crearFalta(locals.usuario.usuarioId, {
			...parsed.data,
			cursoNombre: padron.cursoNombre,
			alumnos: padron.alumnos.map((a) => ({
				...a,
				nota: notas.get(a.alumnoMoodleId)
			}))
		});
		await registrarAccion({
			usuarioId: locals.usuario.usuarioId,
			accion: "crear_falta",
			tablaDestino: "faltas",
			idDestino: id,
			ip: ipDe(request)
		});
	} catch (err) {
		return fail(500, { error: err instanceof Error ? err.message : "Error al guardar" });
	}
	throw redirect(303, "/preceptor/faltas");
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 60;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-llzt7l4z.js')).default;
const server_id = "src/routes/preceptor/faltas/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/60.UfH5ZmEx.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/B8RcQQp0.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/M6KOCQrT.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=60-CRTMudTw.js.map
