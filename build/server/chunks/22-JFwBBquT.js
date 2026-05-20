import { N as NuevaActaSchema, c as crearActa } from './actas-CbOCvb8O.js';
import { r as registrarAccion, i as ipDe } from './audit-1e5DznbM.js';
import { redirect, fail } from '@sveltejs/kit';
import './db-Dn_D9nFJ.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
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
	const { listarCursos } = await import('./cursos-B7GLm9fh.js');
	return { cursos: await listarCursos().catch(() => []) };
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

const index = 22;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DICwWAYh.js')).default;
const server_id = "src/routes/preceptor/actas/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/22.B21OGCQd.js","_app/immutable/chunks/uSN3y40e.js","_app/immutable/chunks/Dl0OQWat.js","_app/immutable/chunks/CVH3xT5D.js","_app/immutable/chunks/DTboM8zL.js","_app/immutable/chunks/B8WnZMYa.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=22-JFwBBquT.js.map
