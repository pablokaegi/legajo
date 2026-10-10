import { e as exigirGabinete } from './acceso-CmxXV0DQ.js';
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
const component = async () => component_cache ??= (await import('./_layout.svelte-BKuebV54.js')).default;
const server_id = "src/routes/gabinete/+layout.server.ts";
const imports = ["_app/immutable/nodes/4.C3wQLFdb.js","_app/immutable/chunks/BUJoxPBc.js","_app/immutable/chunks/BJpAJvNF.js","_app/immutable/chunks/Bj-BB-E5.js","_app/immutable/chunks/C8H49NTu.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=4-_QXu6wdE.js.map
