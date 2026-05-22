import { c as crearEfemeride } from './efemerides-yYiAprvC.js';
import { redirect, fail } from '@sveltejs/kit';
import './db-BwfbdrtT.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/institucional/efemerides/nueva/+page.server.ts
var load = async ({ locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	return {};
};
var actions = { default: async ({ request, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const fd = await request.formData();
	const titulo = fd.get("titulo")?.trim();
	const fecha = fd.get("fecha")?.trim();
	if (!titulo || !fecha) return fail(400, { error: "Título y fecha son requeridos" });
	const cursosArr = (fd.get("cursosResponsables")?.trim() ?? "").split("\n").map((s) => s.trim()).filter(Boolean).map((s) => ({ cursoNombre: s }));
	const cursosJson = cursosArr.length > 0 ? JSON.stringify(cursosArr) : null;
	let id;
	try {
		id = await crearEfemeride(locals.usuario.usuarioId, {
			titulo,
			fecha,
			descripcion: fd.get("descripcion")?.trim() || void 0,
			cursosResponsables: cursosJson ?? void 0,
			docenteResponsable: fd.get("docenteResponsable")?.trim() || void 0,
			estado: fd.get("estado") || "planificado",
			notas: fd.get("notas")?.trim() || void 0
		});
	} catch (e) {
		console.error("[efemerides] Error al crear:", e);
		return fail(500, { error: "Error al guardar la efeméride" });
	}
	throw redirect(303, `/institucional/efemerides/${id}`);
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 23;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BIM1oJW0.js')).default;
const server_id = "src/routes/institucional/efemerides/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/23.DTQJp5I-.js","_app/immutable/chunks/85pPpyzY.js","_app/immutable/chunks/BaKrtv6m.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=23-B0m9vCGF.js.map
