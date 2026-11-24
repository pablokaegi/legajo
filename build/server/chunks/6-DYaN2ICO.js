import { e as exigirStaff } from './acceso2-XBo-WmRi.js';
import './authz-DQJuia-E.js';
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
import './agrupamientos-Dx_h0nb5.js';
import 'node:crypto';

// src/routes/pizarra/+layout.server.ts
var load = async ({ locals }) => {
	await exigirStaff(locals.usuario);
	return { nombreDocente: locals.usuario.nombre };
};

var _layout_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 6;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-9Czbuln6.js')).default;
const server_id = "src/routes/pizarra/+layout.server.ts";
const imports = ["_app/immutable/nodes/6.D-Jo8n13.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=6-DYaN2ICO.js.map
