import { e as exigirGabinete } from './acceso-mvVGKflq.js';
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
import '@sveltejs/kit';

//#region src/routes/gabinete/+layout.server.ts
var load = async ({ locals }) => {
	await exigirGabinete(locals.usuario);
	return {};
};

var _layout_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 4;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-B1rY04Bi.js')).default;
const server_id = "src/routes/gabinete/+layout.server.ts";
const imports = ["_app/immutable/nodes/4.C2AJ4L-x.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/4WnCJOoR.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=4-D5hpC6ze.js.map
