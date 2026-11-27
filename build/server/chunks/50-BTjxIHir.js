import { p as puedeVerCurso, z as puedeCrearObservacion, n as cursosVisiblesPara } from './authz-BVdVv-6k.js';
import { v as verificarAlumnosDelCurso, a as listarCursos, b as listarAlumnosDeCurso } from './cursos2-pDrqIz-A.js';
import { a as ObservacionBaseSchema, b as crearObservacionesBulk } from './observaciones-B9bJRDH-.js';
import { fail, redirect } from '@sveltejs/kit';
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

//#region src/routes/observaciones/nueva/+page.server.ts
var load = async ({ url, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	if (!await puedeCrearObservacion(locals.usuario.usuarioId)) throw redirect(303, "/observaciones/historial");
	const cursos = await cursosVisiblesPara(locals.usuario.usuarioId, await listarCursos().catch(() => []));
	const curso = cursos.find((c) => c.id === Number(url.searchParams.get("cursoId")));
	const alumnoId = Number(url.searchParams.get("alumnoId"));
	const alumnoIds = new Set((url.searchParams.get("alumnos") ?? "").split(",").map(Number));
	const estudiantes = curso && (alumnoId > 0 || url.searchParams.has("alumnos")) ? await listarAlumnosDeCurso(curso.id).catch(() => []) : [];
	const alumno = estudiantes.find((a) => a.id === alumnoId);
	const encontrados = estudiantes.filter((a) => alumnoIds.has(a.id));
	return {
		cursos,
		preselect: {
			cursoId: curso?.id ?? null,
			alumnoId: alumno?.id ?? null,
			alumnoNombre: alumno?.fullname ?? null,
			cursoNombre: (curso?.displayname || curso?.fullname) ?? null,
			alumnos: encontrados.length ? encontrados.map((a) => ({
				id: a.id,
				fullname: a.fullname
			})) : null
		}
	};
};
var actions = { default: async ({ request, locals }) => {
	if (!locals.usuario) return fail(401, { error: "No autorizado" });
	const formData = await request.formData();
	let alumnoIds;
	try {
		const raw = String(formData.get("alumnos") ?? "[]");
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed) || parsed.length === 0) return fail(400, { error: "Debe seleccionar al menos un alumno" });
		alumnoIds = parsed.map((a) => Number(a.alumnoMoodleId));
	} catch {
		return fail(400, { error: "Datos de alumnos inválidos" });
	}
	const usarEval = formData.get("usarEvaluacion") === "1";
	const base = {
		cursoMoodleId: Number(formData.get("cursoMoodleId")),
		cursoNombre: String(formData.get("cursoNombre") ?? ""),
		actitud: usarEval ? parseInt(String(formData.get("actitud") ?? ""), 10) : null,
		tareaCompleta: usarEval ? formData.get("tareaCompleta") === "true" : null,
		participacion: usarEval ? parseInt(String(formData.get("participacion") ?? ""), 10) : null,
		observacionTexto: String(formData.get("observacionTexto") ?? "").trim() || null,
		fecha: String(formData.get("fecha") ?? "")
	};
	const parsed = ObservacionBaseSchema.safeParse(base);
	if (!parsed.success) {
		const errors = parsed.error.flatten().fieldErrors;
		return fail(400, { error: Object.values(errors).flat()[0] ?? "Datos invalidos" });
	}
	if (!await puedeVerCurso(locals.usuario.usuarioId, parsed.data.cursoMoodleId)) return fail(403, { error: "No tenés permiso para registrar observaciones en este curso." });
	let padron;
	try {
		padron = await verificarAlumnosDelCurso(parsed.data.cursoMoodleId, alumnoIds);
	} catch {
		return fail(503, { error: "No se pudo verificar la matrícula en Moodle." });
	}
	if (!padron) return fail(400, { error: "Algún alumno no pertenece al curso." });
	redirect(303, `/observaciones/historial?guardado=${await crearObservacionesBulk(locals.usuario.usuarioId, padron.alumnos, {
		...parsed.data,
		cursoNombre: padron.cursoNombre
	})}`);
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 50;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-C89A3BvS.js')).default;
const server_id = "src/routes/observaciones/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/50.pggwqK7-.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/B8RcQQp0.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/M6KOCQrT.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=50-BTjxIHir.js.map
