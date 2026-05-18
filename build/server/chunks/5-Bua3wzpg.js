import { t as toMoodleErrorMessage } from './client-Cg7YvpsO.js';
import { l as listarCursos } from './cursos-CCgXIkSH.js';
import { redirect } from '@sveltejs/kit';
import './shared-server-9-2j12mp.js';
import './db-D9cZesji.js';
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

const index = 5;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CVJR0mWQ.js')).default;
const server_id = "src/routes/cursos/+page.server.ts";
const imports = ["_app/immutable/nodes/5.BCGrrGdu.js","_app/immutable/chunks/g7562_RU.js","_app/immutable/chunks/CsaauQz1.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=5-Bua3wzpg.js.map
