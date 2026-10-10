import { N as NuevaActaSchema, c as crearActa } from './actas-CxDzOEUa.js';
import { r as registrarAccion, i as ipDe } from './audit-DcTc3_qL.js';
import { redirect, fail } from '@sveltejs/kit';
import './db-DnDhVbjt.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './authz-C2Zplj7X.js';
import 'drizzle-orm';
import 'zod';

//#region src/routes/preceptor/actas/nueva/+page.server.ts
var load = async ({ locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const { listarCursosPreceptoria } = await import('./cursos-BahbOml3.js');
	return { cursos: await listarCursosPreceptoria().catch(() => []) };
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
		alumnos: (() => {
			try {
				return JSON.parse(form.get("alumnos")?.toString() ?? "[]");
			} catch {
				return [];
			}
		})()
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

const index = 45;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CnUpm3Ae.js')).default;
const server_id = "src/routes/preceptor/actas/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/45.C55HAwsi.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/BI88GkAg.js","_app/immutable/chunks/BpBdz8fz.js","_app/immutable/chunks/BrKMbrgq.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=45-D0TaiNAX.js.map
