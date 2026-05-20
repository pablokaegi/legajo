import { c as crearEfemeride } from './efemerides-Bd_txRah.js';
import { redirect, fail } from '@sveltejs/kit';
import './db-Dxq-FYMn.js';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
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
	try {
		throw redirect(303, `/institucional/efemerides/${await crearEfemeride(locals.usuario.usuarioId, {
			titulo,
			fecha,
			descripcion: fd.get("descripcion")?.trim() || void 0,
			cursosResponsables: cursosJson ?? void 0,
			docenteResponsable: fd.get("docenteResponsable")?.trim() || void 0,
			estado: fd.get("estado") || "planificado",
			notas: fd.get("notas")?.trim() || void 0
		})}`);
	} catch (e) {
		if (e instanceof Response) throw e;
		return fail(500, { error: "Error al guardar la efeméride" });
	}
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 13;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Cs_YiYYn.js')).default;
const server_id = "src/routes/institucional/efemerides/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/13.Mj1og0U-.js","_app/immutable/chunks/uSN3y40e.js","_app/immutable/chunks/B8WnZMYa.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=13-DVoX28ps.js.map
