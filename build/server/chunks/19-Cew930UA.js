import { c as puedeCrearObservacion } from './authz-CJZdTBdJ.js';
import { O as ObservacionBaseSchema, c as crearObservacionesBulk } from './observaciones-CBVocrsk.js';
import { l as listarCursos } from './cursos-eZYQi0oH.js';
import { fail, redirect } from '@sveltejs/kit';
import './db-Dxq-FYMn.js';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';
import './client-Cgy_6qiN.js';

//#region src/routes/observaciones/nueva/+page.server.ts
var load = async ({ url, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	if (!await puedeCrearObservacion(locals.usuario.usuarioId)) throw redirect(303, "/observaciones/historial");
	return {
		cursos: await listarCursos().catch(() => []),
		preselect: {
			cursoId: url.searchParams.get("cursoId") ? parseInt(url.searchParams.get("cursoId")) : null,
			alumnoId: url.searchParams.get("alumnoId") ? parseInt(url.searchParams.get("alumnoId")) : null,
			alumnoNombre: url.searchParams.get("alumnoNombre") ?? null
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

const index = 19;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BOSpukVV.js')).default;
const server_id = "src/routes/observaciones/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/19.BoneZz1W.js","_app/immutable/chunks/uSN3y40e.js","_app/immutable/chunks/DmPthTwq.js","_app/immutable/chunks/CKnit0-Q.js","_app/immutable/chunks/BMD2pAf3.js","_app/immutable/chunks/B8WnZMYa.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=19-Cew930UA.js.map
