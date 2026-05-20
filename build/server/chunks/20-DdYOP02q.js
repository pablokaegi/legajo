import { r as registrarAccion, i as ipDe } from './audit-DIlYjN0S.js';
import { N as NuevaReincorporacionSchema, c as crearReincorporacion } from './reincorporaciones-BrwpcxfI.js';
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

//#region src/routes/preceptor/reincorporaciones/nueva/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	return { preselect: {
		alumnoMoodleId: url.searchParams.get("alumnoId") ? Number(url.searchParams.get("alumnoId")) : null,
		alumnoNombre: url.searchParams.get("alumnoNombre") ?? null
	} };
};
var actions = { default: async ({ request, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const form = await request.formData();
	const input = {
		alumnoMoodleId: parseInt(form.get("alumnoMoodleId")?.toString() ?? "0", 10),
		alumnoNombre: form.get("alumnoNombre")?.toString() ?? "",
		fechaReincorporacion: form.get("fechaReincorporacion")?.toString() ?? "",
		observaciones: form.get("observaciones")?.toString() || void 0,
		documentoUrl: form.get("documentoUrl")?.toString() || void 0,
		linkedFaltaId: form.get("linkedFaltaId") ? parseInt(form.get("linkedFaltaId").toString(), 10) : void 0
	};
	const parsed = NuevaReincorporacionSchema.safeParse(input);
	if (!parsed.success) return fail(422, {
		error: "Datos inválidos",
		details: parsed.error.flatten()
	});
	try {
		const id = await crearReincorporacion(locals.usuario.usuarioId, parsed.data);
		await registrarAccion({
			usuarioId: locals.usuario.usuarioId,
			accion: "crear_reincorporacion",
			tablaDestino: "reincorporaciones",
			idDestino: id,
			ip: ipDe(request)
		});
	} catch (err) {
		return fail(500, { error: err instanceof Error ? err.message : "Error al guardar" });
	}
	throw redirect(303, "/preceptor/reincorporaciones");
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 20;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BxCgBwyF.js')).default;
const server_id = "src/routes/preceptor/reincorporaciones/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/20.DTFHMzqp.js","_app/immutable/chunks/DnZ0s7ag.js","_app/immutable/chunks/DYtF0-kB.js","_app/immutable/chunks/DsZAl9AC.js","_app/immutable/chunks/zh8UI4xs.js","_app/immutable/chunks/CuyqONxg.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=20-DdYOP02q.js.map
