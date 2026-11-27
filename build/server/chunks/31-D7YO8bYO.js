import { e as exigirGabinete } from './acceso-mvVGKflq.js';
import { a as ESTADO_IDS, E as ESTADOS_CASO } from './guia-EGVtkUDu.js';
import { l as listarCasos } from './gabinete-BuAqI7Yz.js';
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
import './categorias-BK8Z_nGh.js';
import './agrupamientos-f9JamgYJ.js';
import 'node:crypto';
import './perfilAlumnos-DJX-vZkW.js';
import './client-Dsrb4zGp.js';
import './rest-qugARKMk.js';
import './alerta-BpwCzyy7.js';

//#region src/routes/gabinete/casos/+page.server.ts
var load = async ({ locals, url }) => {
	await exigirGabinete(locals.usuario);
	const estadoRaw = url.searchParams.get("estado") ?? "abiertos";
	const estado = estadoRaw === "todos" ? void 0 : estadoRaw === "abiertos" || ESTADO_IDS.includes(estadoRaw) ? estadoRaw : "abiertos";
	const nivelRaw = Number(url.searchParams.get("nivel"));
	const nivel = [
		1,
		2,
		3
	].includes(nivelRaw) ? nivelRaw : void 0;
	return {
		casos: (await listarCasos({
			estado,
			nivel
		})).map((f) => ({
			...f.caso,
			responsable: f.responsable
		})),
		estado: estadoRaw,
		nivel: nivel ?? 0,
		estados: ESTADOS_CASO
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 31;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DWEGfpDA.js')).default;
const server_id = "src/routes/gabinete/casos/+page.server.ts";
const imports = ["_app/immutable/nodes/31.1cpRa3sv.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js","_app/immutable/chunks/DP1Y9rhH.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=31-D7YO8bYO.js.map
