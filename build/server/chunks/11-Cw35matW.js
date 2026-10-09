import { b as esPreceptorODirectivo } from './authz-52jG9anb.js';
import { l as listarSesiones } from './agrupamientos-CzVZ4XZy.js';
import { e as exigirStaff } from './acceso-CA9aGo2G.js';
import './db-DLV0Mytb.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'node:crypto';
import '@sveltejs/kit';

//#region src/routes/agrupamientos/+page.server.ts
var load = async ({ locals, url }) => {
	const usuarioId = await exigirStaff(locals.usuario);
	const estado = url.searchParams.get("estado") ?? void 0;
	return {
		lista: await listarSesiones({
			estado,
			usuarioId,
			verTodas: await esPreceptorODirectivo(usuarioId)
		}),
		estado: estado ?? ""
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 11;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BNPhu7_v.js')).default;
const server_id = "src/routes/agrupamientos/+page.server.ts";
const imports = ["_app/immutable/nodes/11.Obww5G9U.js","_app/immutable/chunks/DegnJ6pp.js","_app/immutable/chunks/DYR6MKK2.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=11-Cw35matW.js.map
