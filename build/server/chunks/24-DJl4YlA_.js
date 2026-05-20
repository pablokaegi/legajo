import { l as listarAmonestaciones } from './amonestaciones-CrJ597K3.js';
import { redirect } from '@sveltejs/kit';
import './db-Dn_D9nFJ.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
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
	const curso = url.searchParams.get("curso") ?? void 0;
	const alumno = url.searchParams.get("alumno") ?? void 0;
	return {
		lista: await listarAmonestaciones({
			page,
			gravedad,
			cursoQ: curso ? curso.trim() : void 0,
			alumnoQ: alumno ? alumno.trim() : void 0
		}),
		page,
		gravedad: gravedad ?? null,
		cursoQ: curso ?? "",
		alumnoQ: alumno ?? ""
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 24;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Cn8dbGES.js')).default;
const server_id = "src/routes/preceptor/amonestaciones/+page.server.ts";
const imports = ["_app/immutable/nodes/24.BNjxMv50.js","_app/immutable/chunks/uSN3y40e.js","_app/immutable/chunks/B8WnZMYa.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=24-DJl4YlA_.js.map
