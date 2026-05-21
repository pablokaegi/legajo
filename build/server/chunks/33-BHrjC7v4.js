import { l as listarReincorporaciones } from './reincorporaciones-2nWQV-oU.js';
import { redirect } from '@sveltejs/kit';
import './db-Baevsgh0.js';
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

const index = 33;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BiF0uX3t.js')).default;
const server_id = "src/routes/preceptor/reincorporaciones/+page.server.ts";
const imports = ["_app/immutable/nodes/33.Dij_TiQ2.js","_app/immutable/chunks/DgMr71MY.js","_app/immutable/chunks/Dr15X4ZF.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=33-BHrjC7v4.js.map
