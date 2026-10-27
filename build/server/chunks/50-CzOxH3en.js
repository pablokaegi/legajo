import { a as esDirectivoOAdmin } from './authz-_wL7Hkka.js';
import { b as listarActasConAlumnos } from './actas-KyPGiHNy.js';
import { redirect } from '@sveltejs/kit';
import './db-jrdBeEUG.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';

//#region src/routes/preceptor/actas/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const page = parseInt(url.searchParams.get("page") ?? "1", 10);
	const estado = url.searchParams.get("estado") ?? void 0;
	const verTodas = await esDirectivoOAdmin(locals.usuario.usuarioId);
	return {
		lista: await listarActasConAlumnos({
			page,
			estado,
			usuarioId: locals.usuario.usuarioId,
			verTodas
		}),
		page,
		estado: estado ?? null
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 50;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-kI2RLQXY.js')).default;
const server_id = "src/routes/preceptor/actas/+page.server.ts";
const imports = ["_app/immutable/nodes/50.DyWcUFq6.js","_app/immutable/chunks/CcZ_XLq7.js","_app/immutable/chunks/6xwAJV1g.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=50-CzOxH3en.js.map
