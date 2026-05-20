import { N as NuevaActaSchema, c as crearActa } from './actas-DpY5daq0.js';
import { r as registrarAccion, i as ipDe } from './audit-DIlYjN0S.js';
import { redirect, fail } from '@sveltejs/kit';
import './db-C42nfPYx.js';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';

//#region src/routes/preceptor/actas/nueva/+page.server.ts
var load = async ({ locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	return {};
};
var actions = { default: async ({ request, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const form = await request.formData();
	const tareasRaw = form.get("tareas")?.toString() ?? "[]";
	let tareas = [];
	try {
		tareas = JSON.parse(tareasRaw);
	} catch {}
	const asistentesRaw = form.get("asistentes")?.toString() ?? "[]";
	let asistentes = [];
	try {
		asistentes = JSON.parse(asistentesRaw);
	} catch {}
	const input = {
		fecha: form.get("fecha")?.toString() ?? "",
		titulo: form.get("titulo")?.toString() ?? "",
		resumen: form.get("resumen")?.toString() ?? "",
		acuerdos: form.get("acuerdos")?.toString() || void 0,
		tareas,
		asistentes,
		alumnos: []
	};
	const parsed = NuevaActaSchema.safeParse(input);
	if (!parsed.success) return fail(422, {
		error: "Datos inválidos",
		details: parsed.error.flatten()
	});
	let id;
	try {
		id = await crearActa(locals.usuario.usuarioId, parsed.data);
		await registrarAccion({
			usuarioId: locals.usuario.usuarioId,
			accion: "crear_acta",
			tablaDestino: "actas",
			idDestino: id,
			ip: ipDe(request)
		});
	} catch (err) {
		return fail(500, { error: err instanceof Error ? err.message : "Error al guardar" });
	}
	throw redirect(303, `/preceptor/actas/${id}`);
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 13;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DxijD94h.js')).default;
const server_id = "src/routes/preceptor/actas/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/13.z1eQ-GqT.js","_app/immutable/chunks/DnZ0s7ag.js","_app/immutable/chunks/DYtF0-kB.js","_app/immutable/chunks/DsZAl9AC.js","_app/immutable/chunks/zh8UI4xs.js","_app/immutable/chunks/CuyqONxg.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=13-DtjKqPOk.js.map
