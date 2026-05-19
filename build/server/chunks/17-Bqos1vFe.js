import { l as listarFaltas } from './faltas-BEmuNxoe.js';
import { redirect } from '@sveltejs/kit';
import './db-CcRogbU_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';

//#region src/routes/preceptor/faltas/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const page = parseInt(url.searchParams.get("page") ?? "1", 10);
	const curso = url.searchParams.get("curso") ? Number(url.searchParams.get("curso")) : void 0;
	return {
		lista: await listarFaltas({
			page,
			cursoMoodleId: curso
		}),
		page,
		cursoFiltro: curso ?? null
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 17;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CT9H37Ga.js')).default;
const server_id = "src/routes/preceptor/faltas/+page.server.ts";
const imports = ["_app/immutable/nodes/17.BtLYUpdR.js","_app/immutable/chunks/DfszB34S.js","_app/immutable/chunks/CuyqONxg.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=17-Bqos1vFe.js.map
