import { r as registrarAccion } from './audit-Dz9I-BN1.js';
import { e as exigirGabinete } from './acceso-mvVGKflq.js';
import { n as normalizarPeriodo, a as estadisticasGabinete } from './gabineteEstadisticas-B-7efXoI.js';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './authz-BVdVv-6k.js';
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

const index = 37;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DjnHp0Rm.js')).default;
const server_id = "src/routes/gabinete/informe/+page.server.ts";
const imports = ["_app/immutable/nodes/37.B7mSPgpN.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js","_app/immutable/chunks/Aloq5GB_.js","_app/immutable/chunks/4WnCJOoR.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/BBXjWsmW.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=37-6I3Ic52u.js.map
