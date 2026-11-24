import { j as listarSesiones } from './agrupamientos-Dx_h0nb5.js';
import { v as veTodasLasSesiones } from './authz-DQJuia-E.js';
import { e as exigirStaff } from './acceso2-XBo-WmRi.js';
import './db-D7hI4G6x.js';
import './index.js-D6_LEqEo.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit';
import '@sveltejs/kit/internal/server';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'node:crypto';

// src/routes/agrupamientos/+page.server.ts
var load = async ({ locals, url }) => {
	const usuarioId = await exigirStaff(locals.usuario);
	const estado = url.searchParams.get("estado") ?? void 0;
	const verTodas = await veTodasLasSesiones(usuarioId);
	return {
		lista: await listarSesiones({
			estado,
			usuarioId,
			verTodas
		}),
		estado: estado ?? ""
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 13;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BrBRLiRR.js')).default;
const server_id = "src/routes/agrupamientos/+page.server.ts";
const imports = ["_app/immutable/nodes/13.DrbIVlPZ.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=13-BcP-WYm_.js.map
