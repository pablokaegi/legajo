import { o as esPreceptorODirectivo } from './authz-DQJuia-E.js';
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

// src/routes/preceptor/+layout.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, `/auth?redirect=${encodeURIComponent(url.pathname)}`);
	if (!await esPreceptorODirectivo(locals.usuario.usuarioId)) error(403, "Esta sección es solo para preceptores y directivos");
	return { usuario: locals.usuario };
};

var _layout_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 7;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-CFh_Aib4.js')).default;
const server_id = "src/routes/preceptor/+layout.server.ts";
const imports = ["_app/immutable/nodes/7.BTDcovEO.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js","_app/immutable/chunks/C88JlKnk.js","_app/immutable/chunks/DeF1vw6K.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=7-DJL6YsJ2.js.map
