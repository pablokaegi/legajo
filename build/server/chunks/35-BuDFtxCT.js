import { e as exigirGabinete } from './acceso-mvVGKflq.js';
import { a as estadisticasGabinete, n as normalizarPeriodo } from './gabineteEstadisticas-B-7efXoI.js';
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
import './categorias-BK8Z_nGh.js';
import './guia-EGVtkUDu.js';

//#region src/routes/gabinete/estadisticas/+page.server.ts
var load = async ({ locals, url }) => {
	await exigirGabinete(locals.usuario);
	return { e: await estadisticasGabinete(normalizarPeriodo(url.searchParams.get("desde"), url.searchParams.get("hasta"))) };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 35;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BJ7YASIq.js')).default;
const server_id = "src/routes/gabinete/estadisticas/+page.server.ts";
const imports = ["_app/immutable/nodes/35.DWEmb_-Y.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/M6KOCQrT.js","_app/immutable/chunks/DymAb4Hh.js","_app/immutable/chunks/BBXjWsmW.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=35-BuDFtxCT.js.map
