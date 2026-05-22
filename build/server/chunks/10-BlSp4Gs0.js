import { l as listarSesiones } from './agrupamientos-Bk5OlPpq.js';
import { redirect } from '@sveltejs/kit';
import './db-BwfbdrtT.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'node:crypto';

//#region src/routes/agrupamientos/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const estado = url.searchParams.get("estado") ?? void 0;
	return {
		lista: await listarSesiones({ estado }),
		estado: estado ?? ""
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 10;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BNPhu7_v.js')).default;
const server_id = "src/routes/agrupamientos/+page.server.ts";
const imports = ["_app/immutable/nodes/10.BY_8J-3d.js","_app/immutable/chunks/85pPpyzY.js","_app/immutable/chunks/BaKrtv6m.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=10-BlSp4Gs0.js.map
