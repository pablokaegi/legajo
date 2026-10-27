import { r as registrarAccion } from './audit-pcDGE6k9.js';
import { e as exigirGabinete } from './acceso-UlskQ2Cm.js';
import { n as normalizarPeriodo, a as estadisticasGabinete } from './gabineteEstadisticas-BJPIAPar.js';
import './db-jrdBeEUG.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './authz-_wL7Hkka.js';
import 'drizzle-orm';
import '@sveltejs/kit';
import './categorias-BK8Z_nGh.js';
import './guia-EGVtkUDu.js';

//#region src/routes/gabinete/informe/+page.server.ts
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

const index = 36;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-xDvav-BJ.js')).default;
const server_id = "src/routes/gabinete/informe/+page.server.ts";
const imports = ["_app/immutable/nodes/36.UyCcIkP7.js","_app/immutable/chunks/CcZ_XLq7.js","_app/immutable/chunks/6xwAJV1g.js","_app/immutable/chunks/CbFdLoJc.js","_app/immutable/chunks/DIUcaIin.js","_app/immutable/chunks/BAC5IBRF.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=36-D3rgdXr4.js.map
