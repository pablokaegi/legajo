import { l as listarSalidas } from './salidas-Ckdos_xl.js';
import { redirect } from '@sveltejs/kit';
import './db-CnhT25Eo.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
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

const index = 27;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BQ97m8Fj.js')).default;
const server_id = "src/routes/institucional/salidas/+page.server.ts";
const imports = ["_app/immutable/nodes/27.CLNdYgj6.js","_app/immutable/chunks/BYJUstCy.js","_app/immutable/chunks/BD-4OuCl.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=27-E4QWF9Yv.js.map
