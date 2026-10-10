import { e as exigirGabinete } from './acceso-CmxXV0DQ.js';
import { D as DIAS_REVISION, T as TIPOS_INTERVENCION, E as ESTADOS_CASO, G as GUIA_POR_NIVEL } from './guia-EGVtkUDu.js';
import { U as UMBRALES } from './alerta-BpwCzyy7.js';
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

const index = 34;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BVhZk59N.js')).default;
const server_id = "src/routes/gabinete/guia/+page.server.ts";
const imports = ["_app/immutable/nodes/34.D3gkrUns.js","_app/immutable/chunks/BUJoxPBc.js","_app/immutable/chunks/C8H49NTu.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=34-DV1c-EFc.js.map
