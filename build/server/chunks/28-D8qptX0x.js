import { y as puedeVerEvidenciasDeGabinete } from './authz-BVdVv-6k.js';
import { a as listarCursos } from './cursos2-pDrqIz-A.js';
import { e as exigirGabinete } from './acceso-mvVGKflq.js';
import { E as ESTADOS_CASO } from './guia-EGVtkUDu.js';
import { d as destinoCuestionarioCiencias } from './aulaPiloto-DLB6Zm9h.js';
import { a as resumenTablero, l as listarCasos } from './gabinete-BuAqI7Yz.js';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './client-Dsrb4zGp.js';
import './rest-qugARKMk.js';
import '@sveltejs/kit';
import './categorias-BK8Z_nGh.js';
import './agrupamientos-f9JamgYJ.js';
import 'node:crypto';
import './perfilAlumnos-DJX-vZkW.js';
import './alerta-BpwCzyy7.js';

//#region src/routes/gabinete/+page.server.ts
var load = async ({ locals }) => {
	const usuarioId = await exigirGabinete(locals.usuario);
	const destino = destinoCuestionarioCiencias();
	const [resumen, derivados, cursos, verObjetivos] = await Promise.all([
		resumenTablero(),
		listarCasos({ estado: "derivado" }),
		listarCursos().catch(() => []),
		destino ? puedeVerEvidenciasDeGabinete(usuarioId, destino.cursoId) : false
	]);
	return {
		resumen,
		verObjetivos,
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
const component = async () => component_cache ??= (await import('./_page.svelte-CoOHzPQX.js')).default;
const server_id = "src/routes/gabinete/+page.server.ts";
const imports = ["_app/immutable/nodes/28.syAqSzHV.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=28-D8qptX0x.js.map
