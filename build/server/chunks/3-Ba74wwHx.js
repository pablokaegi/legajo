import { e as exigirStaff } from './acceso-CC5WrM6x.js';
import './authz-C2Zplj7X.js';
import './db-DnDhVbjt.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './agrupamientos-DwaMuOx0.js';
import 'node:crypto';
import '@sveltejs/kit';

//#region src/routes/agrupamientos/+layout.server.ts
var load = async ({ locals }) => {
	await exigirStaff(locals.usuario);
	return {};
};

var _layout_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import('./layout.svelte-4Luw9Cns.js')).default;
const server_id = "src/routes/agrupamientos/+layout.server.ts";
const imports = ["_app/immutable/nodes/3.HjalniVJ.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=3-Ba74wwHx.js.map
