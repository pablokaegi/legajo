import { a as listarCursos } from './cursos2-COBKiQyR.js';
import { e as exigirGabinete } from './acceso-UlskQ2Cm.js';
import { E as ESTADOS_CASO } from './guia-EGVtkUDu.js';
import { a as resumenTablero, l as listarCasos } from './gabinete-BZkb7MV-.js';
import './client-BlwuPSaS.js';
import './shared-server-asDUS7ug.js';
import './db-jrdBeEUG.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './authz-_wL7Hkka.js';
import '@sveltejs/kit';
import './categorias-BK8Z_nGh.js';
import './agrupamientos-DefKf2yH.js';
import 'node:crypto';
import './perfilAlumnos-BW2au5of.js';
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

const index = 28;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B5OY3lp2.js')).default;
const server_id = "src/routes/gabinete/+page.server.ts";
const imports = ["_app/immutable/nodes/28.D3cxTu3S.js","_app/immutable/chunks/CcZ_XLq7.js","_app/immutable/chunks/6xwAJV1g.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=28-BPU-dbHf.js.map
