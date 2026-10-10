import { e as exigirGabinete } from './acceso2-BZbylWqk.js';
import { a as ESTADO_IDS, E as ESTADOS_CASO } from './guia-Cz0z5vQo.js';
import { l as listarCasos } from './gabinete-BUkdUbGK.js';
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
import './agrupamientos-DwaMuOx0.js';
import 'node:crypto';
import './perfilAlumnos-LVNftgNy.js';
import './client-CURRDhAR.js';

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

const index = 29;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-d87KGvcB.js')).default;
const server_id = "src/routes/gabinete/casos/+page.server.ts";
const imports = ["_app/immutable/nodes/29.B6LiiH-o.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=29-BVIYaoPi.js.map
