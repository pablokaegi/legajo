import { e as exigirGabinete } from './acceso-B66Nug0v.js';
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

// src/routes/gabinete/+layout.server.ts
var load = async ({ locals }) => {
	await exigirGabinete(locals.usuario);
	return {};
};

var _layout_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 4;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-BVDcjjvw.js')).default;
const server_id = "src/routes/gabinete/+layout.server.ts";
const imports = ["_app/immutable/nodes/4.BdLPrsk9.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js","_app/immutable/chunks/C88JlKnk.js","_app/immutable/chunks/DeF1vw6K.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=4-DEocyWqc.js.map
