import { l as listarSesiones } from './agrupamientos-BFNT9uir.js';
import { redirect } from '@sveltejs/kit';
import './db-BwwlYHWL.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'node:crypto';

//#region src/routes/institucional/agrupamientos/+page.server.ts
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

const index = 12;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-AWohwjHz.js')).default;
const server_id = "src/routes/institucional/agrupamientos/+page.server.ts";
const imports = ["_app/immutable/nodes/12.DckgLV8h.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/BEDIq91W.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=12-CbSxwI86.js.map
