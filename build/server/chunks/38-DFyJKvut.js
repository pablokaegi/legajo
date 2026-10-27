import { l as listarEfemerides } from './efemerides-BkNYiLJu.js';
import { redirect } from '@sveltejs/kit';
import './db-jrdBeEUG.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/institucional/efemerides/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const page = parseInt(url.searchParams.get("page") ?? "1", 10);
	const estado = url.searchParams.get("estado") ?? void 0;
	return {
		lista: await listarEfemerides({
			page,
			estado
		}),
		page,
		estado: estado ?? ""
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 38;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CmUQkxqC.js')).default;
const server_id = "src/routes/institucional/efemerides/+page.server.ts";
const imports = ["_app/immutable/nodes/38.BbAy8kL7.js","_app/immutable/chunks/CcZ_XLq7.js","_app/immutable/chunks/6xwAJV1g.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=38-DFyJKvut.js.map
