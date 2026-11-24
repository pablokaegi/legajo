import { l as listarCasos } from './gabinete-C3k7P2xt.js';
import { e as exigirGabinete } from './acceso-B66Nug0v.js';
import { a as ESTADO_IDS, E as ESTADOS_CASO } from './guia-YkJkXwF5.js';
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
import './perfilAlumnos-0dDRb6h3.js';
import './client-txz_W3Xb.js';
import 'drizzle-orm';
import './agrupamientos-Dx_h0nb5.js';
import './authz-DQJuia-E.js';
import 'node:crypto';
import './alerta-BSs4IT19.js';
import './categorias-BW0OCDku.js';

// src/routes/gabinete/casos/+page.server.ts
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
const component = async () => component_cache ??= (await import('./_page.svelte-DO_jDt5u.js')).default;
const server_id = "src/routes/gabinete/casos/+page.server.ts";
const imports = ["_app/immutable/nodes/29.C7y58I7F.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js","_app/immutable/chunks/DuKVIOIg.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=29-DVb60eLW.js.map
