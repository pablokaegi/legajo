import { a as esDirectivoOAdmin } from './authz-C5Ea-Q2l.js';
import { b as listarActasConAlumnos } from './actas-CQzFujZG.js';
import { redirect } from '@sveltejs/kit';
import './db-BCTfN-Zz.js';
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

const index = 33;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-isINAqCo.js')).default;
const server_id = "src/routes/preceptor/actas/+page.server.ts";
const imports = ["_app/immutable/nodes/33.Bjl22Vtq.js","_app/immutable/chunks/Bub9jyPb.js","_app/immutable/chunks/DYR6MKK2.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=33-BoZAjvg0.js.map
