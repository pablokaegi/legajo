import { e as esStaff } from './authz-DQJuia-E.js';
import { redirect, error } from '@sveltejs/kit';
import './db-D7hI4G6x.js';
import './index.js-D6_LEqEo.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

// src/routes/laboratorio/apoyos/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) redirect(303, `/auth?redirect=${encodeURIComponent(url.pathname)}`);
	if (!await esStaff(locals.usuario.usuarioId)) error(403, "El Laboratorio de apoyos es para el personal autorizado.");
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 44;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DTX0EE6M.js')).default;
const server_id = "src/routes/laboratorio/apoyos/+page.server.ts";
const imports = ["_app/immutable/nodes/44.BQLtRtxM.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js"];
const stylesheets = ["_app/immutable/assets/44.C7MoQ-wq.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=44-D7w3RzdH.js.map
