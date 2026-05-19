import { l as listarAmonestaciones } from './amonestaciones-CIelOfJp.js';
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

//#region src/routes/preceptor/amonestaciones/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const page = parseInt(url.searchParams.get("page") ?? "1", 10);
	const gravedad = url.searchParams.get("gravedad") ?? void 0;
	return {
		lista: await listarAmonestaciones({
			page,
			gravedad
		}),
		page,
		gravedad: gravedad ?? null
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 15;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DRnBYr0u.js')).default;
const server_id = "src/routes/preceptor/amonestaciones/+page.server.ts";
const imports = ["_app/immutable/nodes/15.CyL0jQ66.js","_app/immutable/chunks/DfszB34S.js","_app/immutable/chunks/CuyqONxg.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=15-YRtJ1okg.js.map
