import { e as exigirGabinete } from './acceso-UlskQ2Cm.js';
import { a as estadisticasGabinete, n as normalizarPeriodo } from './gabineteEstadisticas-BJPIAPar.js';
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

const index = 34;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BJj0gZbN.js')).default;
const server_id = "src/routes/gabinete/estadisticas/+page.server.ts";
const imports = ["_app/immutable/nodes/34.rJ9CSsEg.js","_app/immutable/chunks/CcZ_XLq7.js","_app/immutable/chunks/BucuNVqd.js","_app/immutable/chunks/BjkzJqKW.js","_app/immutable/chunks/6xwAJV1g.js","_app/immutable/chunks/BAC5IBRF.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=34-BP5s4wxl.js.map
