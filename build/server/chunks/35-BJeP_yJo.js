import { e as exigirGabinete } from './acceso-B66Nug0v.js';
import { n as normalizarPeriodo, a as estadisticasGabinete } from './gabineteEstadisticas-DbJ6MEAo.js';
import { r as registrarAccion } from './audit-DjKqoMaH.js';
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

// src/routes/gabinete/informe/+page.server.ts
var load = async ({ locals, url }) => {
	const usuarioId = await exigirGabinete(locals.usuario);
	const periodo = normalizarPeriodo(url.searchParams.get("desde"), url.searchParams.get("hasta"));
	await registrarAccion({
		usuarioId,
		accion: "gabinete.informe.institucional",
		payload: periodo
	});
	return {
		e: await estadisticasGabinete(periodo),
		emisor: locals.usuario.nombre
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 35;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-rq4OB3m3.js')).default;
const server_id = "src/routes/gabinete/informe/+page.server.ts";
const imports = ["_app/immutable/nodes/35.DGXXenAe.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js","_app/immutable/chunks/B5ZQzlDl.js","_app/immutable/chunks/BED2mB-Q.js","_app/immutable/chunks/D8_Sn2Qf.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=35-BJeP_yJo.js.map
