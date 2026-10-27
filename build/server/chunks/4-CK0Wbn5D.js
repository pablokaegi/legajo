import { e as exigirGabinete } from './acceso-UlskQ2Cm.js';
import './authz-_wL7Hkka.js';
import './db-jrdBeEUG.js';
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
const component = async () => component_cache ??= (await import('./_layout.svelte-BwTvevtS.js')).default;
const server_id = "src/routes/gabinete/+layout.server.ts";
const imports = ["_app/immutable/nodes/4.DBpn4NOn.js","_app/immutable/chunks/CcZ_XLq7.js","_app/immutable/chunks/Dcis9sER.js","_app/immutable/chunks/BucuNVqd.js","_app/immutable/chunks/6xwAJV1g.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=4-CK0Wbn5D.js.map
