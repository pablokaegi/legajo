import { c as puedeCrearObservacion } from './authz-GJL0_cK3.js';
import { O as ObservacionSchema, c as crearObservacion } from './observaciones-C7yq_9Ei.js';
import { l as listarCursos } from './cursos-DB2yJeVE.js';
import { fail, redirect } from '@sveltejs/kit';
import './db-CcRogbU_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';
import './client-C5rBgvQ9.js';

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
	const raw = {
		alumnoMoodleId: parseInt(String(formData.get("alumnoMoodleId") ?? ""), 10),
		alumnoNombre: String(formData.get("alumnoNombre") ?? ""),
		cursoMoodleId: parseInt(String(formData.get("cursoMoodleId") ?? ""), 10),
		cursoNombre: String(formData.get("cursoNombre") ?? ""),
		actitud: parseInt(String(formData.get("actitud") ?? ""), 10),
		tareaCompleta: formData.get("tareaCompleta") === "true",
		participacion: parseInt(String(formData.get("participacion") ?? ""), 10),
		observacionTexto: String(formData.get("observacionTexto") ?? "").trim() || null,
		fecha: String(formData.get("fecha") ?? "")
	};
	const parsed = ObservacionSchema.safeParse(raw);
	if (!parsed.success) {
		const errors = parsed.error.flatten().fieldErrors;
		return fail(400, {
			error: Object.values(errors).flat()[0] ?? "Datos invalidos",
			values: raw
		});
	}
	await crearObservacion(locals.usuario.usuarioId, parsed.data);
	redirect(303, "/observaciones/historial?guardado=1");
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 10;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-zzdSa-pQ.js')).default;
const server_id = "src/routes/observaciones/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/10.Cj5zrAGu.js","_app/immutable/chunks/DfszB34S.js","_app/immutable/chunks/DML83hgG.js","_app/immutable/chunks/BgK0o4kr.js","_app/immutable/chunks/ijDwPtqP.js","_app/immutable/chunks/CuyqONxg.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=10-C_jgVqXj.js.map
