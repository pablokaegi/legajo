import { e as exigirGabinete } from './acceso-B66Nug0v.js';
import { n as normalizarPeriodo, a as estadisticasGabinete } from './gabineteEstadisticas-DbJ6MEAo.js';
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
import './categorias-BW0OCDku.js';
import './guia-YkJkXwF5.js';

// src/routes/gabinete/estadisticas/+page.server.ts
var load = async ({ locals, url }) => {
	await exigirGabinete(locals.usuario);
	const periodo = normalizarPeriodo(url.searchParams.get("desde"), url.searchParams.get("hasta"));
	return { e: await estadisticasGabinete(periodo) };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 33;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Bh_BJdxZ.js')).default;
const server_id = "src/routes/gabinete/estadisticas/+page.server.ts";
const imports = ["_app/immutable/nodes/33.JI33XgNw.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js","_app/immutable/chunks/DeF1vw6K.js","_app/immutable/chunks/C0D3a8lr.js","_app/immutable/chunks/D8_Sn2Qf.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=33-DwYdeIZJ.js.map
