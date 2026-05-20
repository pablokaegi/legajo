import { t as toMoodleErrorMessage } from './client-BGsR3K7T.js';
import { l as listarCursos } from './cursos2-BbLts006.js';
import { redirect } from '@sveltejs/kit';
import './shared-server-asDUS7ug.js';
import './db-jloi_eIm.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/cursos/+page.server.ts
var load = async ({ locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	try {
		return {
			cursos: await listarCursos(),
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

const index = 8;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DhEPpy-S.js')).default;
const server_id = "src/routes/cursos/+page.server.ts";
const imports = ["_app/immutable/nodes/8.CHm2E3tX.js","_app/immutable/chunks/uSN3y40e.js","_app/immutable/chunks/B8WnZMYa.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=8-BOLqho4m.js.map
