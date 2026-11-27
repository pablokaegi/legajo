import { a as esDirectivoOAdmin } from './authz-BVdVv-6k.js';
import { b as listarActasConAlumnos } from './actas-Hw_s7wsH.js';
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

const index = 54;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-jnFhAdG7.js')).default;
const server_id = "src/routes/preceptor/actas/+page.server.ts";
const imports = ["_app/immutable/nodes/54.D9aZfEfk.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=54-0RnbCExD.js.map
