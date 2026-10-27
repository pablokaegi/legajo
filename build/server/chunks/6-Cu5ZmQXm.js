import { e as exigirStaff } from './acceso2-BashTpDd.js';
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
import './agrupamientos-DefKf2yH.js';
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
const component = async () => component_cache ??= (await import('./_layout.svelte-B_ca3C9-.js')).default;
const server_id = "src/routes/pizarra/+layout.server.ts";
const imports = ["_app/immutable/nodes/6.BqlVBJih.js","_app/immutable/chunks/CcZ_XLq7.js","_app/immutable/chunks/6xwAJV1g.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=6-Cu5ZmQXm.js.map
