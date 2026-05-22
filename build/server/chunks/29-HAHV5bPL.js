import { j as puedeCrearObservacion } from './authz-C3UU1LOA.js';
import { a as ObservacionBaseSchema, b as crearObservacionesBulk } from './observaciones-CqY_BSfZ.js';
import { a as listarCursos, b as listarAlumnosDeCurso } from './cursos2-_ifhGnXM.js';
import { fail, redirect } from '@sveltejs/kit';
import './db-BwfbdrtT.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';
import './client-DB9NWpTW.js';

//#region src/routes/observaciones/nueva/+page.server.ts
var load = async ({ url, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	if (!await puedeCrearObservacion(locals.usuario.usuarioId)) throw redirect(303, "/observaciones/historial");
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
					alumnoId: null,
					alumnoNombre: null,
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
			cursoId: cursoIdParam ? parseInt(cursoIdParam) : null,
			alumnoId: alumnoIdParam ? parseInt(alumnoIdParam) : null,
			alumnoNombre: url.searchParams.get("alumnoNombre") ?? null,
			cursoNombre: null,
			alumnos: null
		}
	};
};
var actions = { default: async ({ request, locals }) => {
	if (!locals.usuario) return fail(401, { error: "No autorizado" });
	if (!await puedeCrearObservacion(locals.usuario.usuarioId)) return fail(403, { error: "No tenes permiso para crear observaciones" });
	const formData = await request.formData();
	let alumnos = [];
	try {
		const raw = String(formData.get("alumnos") ?? "[]");
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
	const usarEval = formData.get("usarEvaluacion") === "1";
	const base = {
		cursoMoodleId: parseInt(String(formData.get("cursoMoodleId") ?? ""), 10),
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
	redirect(303, `/observaciones/historial?guardado=${await crearObservacionesBulk(locals.usuario.usuarioId, alumnos, parsed.data)}`);
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 29;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CG2eHWEX.js')).default;
const server_id = "src/routes/observaciones/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/29.DC0BmFmc.js","_app/immutable/chunks/85pPpyzY.js","_app/immutable/chunks/DsqKlT4O.js","_app/immutable/chunks/C2CxDrSD.js","_app/immutable/chunks/DQg3U3Yx.js","_app/immutable/chunks/BaKrtv6m.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=29-HAHV5bPL.js.map
