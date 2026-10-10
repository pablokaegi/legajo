import { a as listarCursos } from './cursos2-BTSWVjNq.js';
import { e as exigirGabinete } from './acceso2-BZbylWqk.js';
import { E as ESTADOS_CASO } from './guia-Cz0z5vQo.js';
import { a as resumenTablero, l as listarCasos } from './gabinete-BUkdUbGK.js';
import './client-CURRDhAR.js';
import './shared-server-asDUS7ug.js';
import './db-DnDhVbjt.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './authz-C2Zplj7X.js';
import '@sveltejs/kit';
import './agrupamientos-DwaMuOx0.js';
import 'node:crypto';
import './perfilAlumnos-LVNftgNy.js';

//#region src/routes/gabinete/+page.server.ts
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
const component = async () => component_cache ??= (await import('./_page.svelte-tE5O-YPG.js')).default;
const server_id = "src/routes/gabinete/+page.server.ts";
const imports = ["_app/immutable/nodes/27.DWPvPCXk.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=27-DyMQtuHP.js.map
