import { e as exigirGabinete } from './acceso2-BZbylWqk.js';
import { U as UMBRALES, D as DIAS_REVISION, b as TIPOS_INTERVENCION, E as ESTADOS_CASO, G as GUIA_POR_NIVEL } from './guia-Cz0z5vQo.js';
import './authz-C2Zplj7X.js';
import './db-DnDhVbjt.js';
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

const index = 32;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CJzSo_lC.js')).default;
const server_id = "src/routes/gabinete/guia/+page.server.ts";
const imports = ["_app/immutable/nodes/32.HMM6NJjq.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=32-DAzXbScJ.js.map
