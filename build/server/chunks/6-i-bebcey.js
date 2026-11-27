import { e as exigirStaff } from './acceso2-CDk--U70.js';
import './authz-BVdVv-6k.js';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './agrupamientos-f9JamgYJ.js';
import 'node:crypto';
import '@sveltejs/kit';

//#region src/routes/pizarra/+layout.server.ts
var load = async ({ locals }) => {
	await exigirStaff(locals.usuario);
	return { nombreDocente: locals.usuario.nombre };
};

var _layout_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 6;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-bxsEoP2k.js')).default;
const server_id = "src/routes/pizarra/+layout.server.ts";
const imports = ["_app/immutable/nodes/6.DRAF9rq_.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=6-i-bebcey.js.map
