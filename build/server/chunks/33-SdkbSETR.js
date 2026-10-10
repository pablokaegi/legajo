import { e as exigirGabinete } from './acceso-CmxXV0DQ.js';
import { a as estadisticasGabinete, n as normalizarPeriodo } from './gabineteEstadisticas-D4ugFyDu.js';
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

const index = 33;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CX5moHuw.js')).default;
const server_id = "src/routes/gabinete/estadisticas/+page.server.ts";
const imports = ["_app/immutable/nodes/33.BACQT_nH.js","_app/immutable/chunks/BUJoxPBc.js","_app/immutable/chunks/3l6Q5lPp.js","_app/immutable/chunks/D-v2tPeI.js","_app/immutable/chunks/C8H49NTu.js","_app/immutable/chunks/nAXoMS7N.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=33-SdkbSETR.js.map
