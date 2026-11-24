import { a as listarCursos } from './cursos2-BuIc_Cww.js';
import './client-txz_W3Xb.js';
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

// src/routes/pizarra/+page.server.ts
var load = async () => {
	return { cursos: (await listarCursos().catch(() => [])).map((c) => ({
		id: c.id,
		nombre: c.displayname || c.fullname
	})).sort((a, b) => a.nombre.localeCompare(b.nombre, "es")) };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 47;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Bz3Nni2e.js')).default;
const server_id = "src/routes/pizarra/+page.server.ts";
const imports = ["_app/immutable/nodes/47.BtOV9ifx.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=47-DYQgElbZ.js.map
