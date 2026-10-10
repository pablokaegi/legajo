import { r as registrarAccion } from './audit-QNN2zM9t.js';
import { e as exigirGabinete } from './acceso-CmxXV0DQ.js';
import { n as normalizarPeriodo, a as estadisticasGabinete } from './gabineteEstadisticas-D4ugFyDu.js';
import './db-DeyHlLbL.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './authz-BOxGka1D.js';
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

const index = 35;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DUk25HWa.js')).default;
const server_id = "src/routes/gabinete/informe/+page.server.ts";
const imports = ["_app/immutable/nodes/35.B660XIMm.js","_app/immutable/chunks/BUJoxPBc.js","_app/immutable/chunks/C8H49NTu.js","_app/immutable/chunks/DsHk46bm.js","_app/immutable/chunks/DuRwxM2R.js","_app/immutable/chunks/nAXoMS7N.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=35-CjUs5jYl.js.map
