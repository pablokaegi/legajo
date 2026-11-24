import { a as listarCursos } from './cursos2-BuIc_Cww.js';
import { a as resumenTablero, l as listarCasos } from './gabinete-C3k7P2xt.js';
import { e as exigirGabinete } from './acceso-B66Nug0v.js';
import { E as ESTADOS_CASO } from './guia-YkJkXwF5.js';
import './client-txz_W3Xb.js';
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
import './perfilAlumnos-0dDRb6h3.js';
import './agrupamientos-Dx_h0nb5.js';
import './authz-DQJuia-E.js';
import 'node:crypto';
import './alerta-BSs4IT19.js';
import './categorias-BW0OCDku.js';

// src/routes/gabinete/+page.server.ts
var load = async ({ locals }) => {
	await exigirGabinete(locals.usuario);
	const [resumen, derivados, cursos] = await Promise.all([
		resumenTablero(),
		listarCasos({ estado: "derivado" }),
		listarCursos().catch(() => [])
	]);
	return {
		resumen,
		derivados: derivados.map((d) => ({
			...d.caso,
			responsable: d.responsable
		})),
		cursos: cursos.map((c) => ({
			id: c.id,
			nombre: c.displayname || c.fullname
		})),
		estados: ESTADOS_CASO
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 27;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-ozcUNlQj.js')).default;
const server_id = "src/routes/gabinete/+page.server.ts";
const imports = ["_app/immutable/nodes/27.D8CBNi_O.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=27-CNoI2qHX.js.map
