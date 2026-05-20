import { l as listarSalidas } from './salidas-Be1z8cLp.js';
import { redirect } from '@sveltejs/kit';
import './db-Dxq-FYMn.js';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'node:crypto';

//#region src/routes/institucional/salidas/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const page = parseInt(url.searchParams.get("page") ?? "1", 10);
	const estado = url.searchParams.get("estado") ?? void 0;
	return {
		lista: await listarSalidas({
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

const index = 15;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CXm1G2GS.js')).default;
const server_id = "src/routes/institucional/salidas/+page.server.ts";
const imports = ["_app/immutable/nodes/15.hNwysQpB.js","_app/immutable/chunks/uSN3y40e.js","_app/immutable/chunks/B8WnZMYa.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=15-HjIkDHf-.js.map
