import { e as exigirGabinete } from './acceso-B66Nug0v.js';
import { D as DIAS_REVISION, T as TIPOS_INTERVENCION, E as ESTADOS_CASO, G as GUIA_POR_NIVEL } from './guia-YkJkXwF5.js';
import { U as UMBRALES } from './alerta-BSs4IT19.js';
import './authz-DQJuia-E.js';
import './db-D7hI4G6x.js';
import './index.js-D6_LEqEo.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit';
import '@sveltejs/kit/internal/server';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

// src/routes/gabinete/guia/+page.server.ts
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
const component = async () => component_cache ??= (await import('./_page.svelte-Dxyjawsc.js')).default;
const server_id = "src/routes/gabinete/guia/+page.server.ts";
const imports = ["_app/immutable/nodes/34.BbB0zA0G.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=34-D-YqVScB.js.map
