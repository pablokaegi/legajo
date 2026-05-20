import { r as registrarAccion, i as ipDe } from './audit-ptP7jPlB.js';
import { N as NuevaReincorporacionSchema, c as crearReincorporacion } from './reincorporaciones-3uMQ5JLa.js';
import { redirect, fail } from '@sveltejs/kit';
import './db-XKMgjins.js';
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

const index = 21;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DCStnddk.js')).default;
const server_id = "src/routes/preceptor/reincorporaciones/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/21.BsY7LOOG.js","_app/immutable/chunks/BCmZRGrY.js","_app/immutable/chunks/DZT7GpYL.js","_app/immutable/chunks/CgXVuoOo.js","_app/immutable/chunks/BS0xk4ku.js","_app/immutable/chunks/2TU3FloQ.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=21-D_eRjEKw.js.map
