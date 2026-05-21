import { l as listarSesiones } from './agrupamientos-8gsrQUb1.js';
import { redirect } from '@sveltejs/kit';
import './db-Baevsgh0.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/institucional/agrupamientos/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const estado = url.searchParams.get("estado") ?? void 0;
	return {
		lista: await listarSesiones({ estado }),
		estado: estado ?? ""
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 12;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-AWohwjHz.js')).default;
const server_id = "src/routes/institucional/agrupamientos/+page.server.ts";
const imports = ["_app/immutable/nodes/12.zuHi8qRC.js","_app/immutable/chunks/DgMr71MY.js","_app/immutable/chunks/Dr15X4ZF.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=12-B69CoSug.js.map
