import { j as alcancePreceptoria } from './authz-BVdVv-6k.js';
import { l as listarReincorporaciones } from './reincorporaciones-dbLXsgJn.js';
import { redirect, error } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';

//#region src/routes/preceptor/reincorporaciones/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	if (await alcancePreceptoria(locals.usuario.usuarioId) !== null) error(403, "Este registro requiere acceso institucional.");
	const page = parseInt(url.searchParams.get("page") ?? "1", 10);
	return {
		lista: await listarReincorporaciones({ page }),
		page
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 62;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DF9Tamlv.js')).default;
const server_id = "src/routes/preceptor/reincorporaciones/+page.server.ts";
const imports = ["_app/immutable/nodes/62.B3T3zQLu.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=62-DOtRkVMe.js.map
