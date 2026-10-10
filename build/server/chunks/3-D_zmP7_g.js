import { e as exigirStaff } from './acceso2-DC8bIya7.js';
import './authz-BOxGka1D.js';
import './db-DeyHlLbL.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './agrupamientos-C51657gi.js';
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
const imports = ["_app/immutable/nodes/3.CT88kvh-.js","_app/immutable/chunks/BUJoxPBc.js","_app/immutable/chunks/C8H49NTu.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=3-D_zmP7_g.js.map
