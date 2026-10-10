import { t as toMoodleErrorMessage } from './client-CURRDhAR.js';
import { a as listarCursos } from './cursos2-BTSWVjNq.js';
import { redirect } from '@sveltejs/kit';
import './shared-server-asDUS7ug.js';
import './db-DnDhVbjt.js';
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

const index = 23;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DhEPpy-S.js')).default;
const server_id = "src/routes/cursos/+page.server.ts";
const imports = ["_app/immutable/nodes/23.BAQuWhxj.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=23-Dk3jLdfa.js.map
