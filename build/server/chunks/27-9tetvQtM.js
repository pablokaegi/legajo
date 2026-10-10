import { a as listarCursos } from './cursos2-B5YEKkXD.js';
import { e as exigirGabinete } from './acceso-CmxXV0DQ.js';
import { E as ESTADOS_CASO } from './guia-EGVtkUDu.js';
import { a as resumenTablero, l as listarCasos } from './gabinete-BwSSA8WI.js';
import './client-uxwLBcGc.js';
import './shared-server-asDUS7ug.js';
import './db-DeyHlLbL.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './authz-BOxGka1D.js';
import '@sveltejs/kit';
import './categorias-BK8Z_nGh.js';
import './agrupamientos-C51657gi.js';
import 'node:crypto';
import './perfilAlumnos-DTtq39Z_.js';
import './alerta-BpwCzyy7.js';

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
const component = async () => component_cache ??= (await import('./_page.svelte-CUYutvUx.js')).default;
const server_id = "src/routes/gabinete/+page.server.ts";
const imports = ["_app/immutable/nodes/27.CqPUmxBL.js","_app/immutable/chunks/BUJoxPBc.js","_app/immutable/chunks/C8H49NTu.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=27-9tetvQtM.js.map
