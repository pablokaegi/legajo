import { w as alcancesAgrupamientos } from './authz-BVdVv-6k.js';
import { j as listarSesiones } from './agrupamientos-f9JamgYJ.js';
import { e as exigirStaff } from './acceso2-CDk--U70.js';
import './db-CLN6I8p_.js';
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
		lista: (await listarSesiones({
			estado,
			usuarioId,
			...await alcancesAgrupamientos(usuarioId)
		})).map(({ id, titulo, cursoNombre, estado, fecha, cantidadVotos }) => ({
			id,
			titulo,
			cursoNombre,
			estado,
			fecha,
			cantidadVotos
		})),
		estado: estado ?? ""
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 13;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-mIjuO5Km.js')).default;
const server_id = "src/routes/agrupamientos/+page.server.ts";
const imports = ["_app/immutable/nodes/13.FDpN6zKC.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=13-BcfPt198.js.map
