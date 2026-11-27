import { n as cursosVisiblesPara } from './authz-BVdVv-6k.js';
import { t as toMoodleErrorMessage } from './rest-qugARKMk.js';
import { a as listarCursos } from './cursos2-pDrqIz-A.js';
import { redirect } from '@sveltejs/kit';
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

//#region src/routes/cursos/+page.server.ts
var load = async ({ locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	try {
		return {
			cursos: await cursosVisiblesPara(locals.usuario.usuarioId, await listarCursos()),
			error: null
		};
	} catch (err) {
		return {
			cursos: [],
			error: toMoodleErrorMessage(err)
		};
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 24;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-wm4zIKj3.js')).default;
const server_id = "src/routes/cursos/+page.server.ts";
const imports = ["_app/immutable/nodes/24.DGJGl6uu.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=24-BoVsJpm2.js.map
