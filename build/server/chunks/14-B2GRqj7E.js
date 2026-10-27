import { v as veTodasLasSesiones } from './authz-_wL7Hkka.js';
import { j as listarSesiones } from './agrupamientos-DefKf2yH.js';
import { e as exigirStaff } from './acceso2-BashTpDd.js';
import './db-jrdBeEUG.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'node:crypto';
import '@sveltejs/kit';

//#region src/routes/agrupamientos/+page.server.ts
var load = async ({ locals, url }) => {
	const usuarioId = await exigirStaff(locals.usuario);
	const estado = url.searchParams.get("estado") ?? void 0;
	return {
		lista: await listarSesiones({
			estado,
			usuarioId,
			verTodas: await veTodasLasSesiones(usuarioId)
		}),
		estado: estado ?? ""
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 14;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DwEo7G2J.js')).default;
const server_id = "src/routes/agrupamientos/+page.server.ts";
const imports = ["_app/immutable/nodes/14.CIatJ0kr.js","_app/immutable/chunks/CcZ_XLq7.js","_app/immutable/chunks/6xwAJV1g.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=14-B2GRqj7E.js.map
