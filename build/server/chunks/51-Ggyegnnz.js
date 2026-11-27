import { n as cursosVisiblesPara } from './authz-BVdVv-6k.js';
import { a as listarCursos } from './cursos2-pDrqIz-A.js';
import { e as exigirStaff } from './acceso2-CDk--U70.js';
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
import './agrupamientos-f9JamgYJ.js';
import 'node:crypto';
import '@sveltejs/kit';

//#region src/routes/pizarra/+page.server.ts
var load = async ({ locals }) => {
	return { cursos: (await cursosVisiblesPara(await exigirStaff(locals.usuario), await listarCursos().catch(() => []))).map((c) => ({
		id: c.id,
		nombre: c.displayname || c.fullname
	})).sort((a, b) => a.nombre.localeCompare(b.nombre, "es")) };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 51;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BAof1Smn.js')).default;
const server_id = "src/routes/pizarra/+page.server.ts";
const imports = ["_app/immutable/nodes/51.DI4HoNfS.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=51-Ggyegnnz.js.map
