import { o as obtenerActaCompleta } from './actas-CFg_vdq9.js';
import { redirect, error } from '@sveltejs/kit';
import './db-jloi_eIm.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';

//#region src/routes/preceptor/actas/[id]/+page.server.ts
var load = async ({ locals, params }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const id = parseInt(params.id, 10);
	if (isNaN(id)) error(400, "ID inválido");
	const acta = await obtenerActaCompleta(id);
	if (!acta) error(404, "Acta no encontrada");
	return { acta };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 23;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CXuOkQVN.js')).default;
const server_id = "src/routes/preceptor/actas/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/23.MT6daolp.js","_app/immutable/chunks/uSN3y40e.js","_app/immutable/chunks/B8WnZMYa.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=23-B8UmQhC0.js.map
