import { e as exigirGabinete } from './acceso-mvVGKflq.js';
import { D as DIAS_REVISION, T as TIPOS_INTERVENCION, E as ESTADOS_CASO, G as GUIA_POR_NIVEL } from './guia-EGVtkUDu.js';
import { U as UMBRALES } from './alerta-BpwCzyy7.js';
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

//#region src/routes/gabinete/guia/+page.server.ts
var load = async ({ locals }) => {
	await exigirGabinete(locals.usuario);
	return {
		guia: GUIA_POR_NIVEL,
		estados: ESTADOS_CASO,
		tipos: TIPOS_INTERVENCION,
		dias: DIAS_REVISION,
		umbrales: UMBRALES
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 36;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DxKPGm74.js')).default;
const server_id = "src/routes/gabinete/guia/+page.server.ts";
const imports = ["_app/immutable/nodes/36.B6UnU32P.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=36-CHp_K35c.js.map
