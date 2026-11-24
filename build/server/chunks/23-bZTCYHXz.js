import { a as listarCursos } from './cursos2-BuIc_Cww.js';
import { t as toMoodleErrorMessage } from './client-txz_W3Xb.js';
import { redirect } from '@sveltejs/kit';
import './db-D7hI4G6x.js';
import './index.js-D6_LEqEo.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

// src/routes/cursos/+page.server.ts
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
const component = async () => component_cache ??= (await import('./_page.svelte-D2K19Qyw.js')).default;
const server_id = "src/routes/cursos/+page.server.ts";
const imports = ["_app/immutable/nodes/23.BFund7_g.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=23-bZTCYHXz.js.map
