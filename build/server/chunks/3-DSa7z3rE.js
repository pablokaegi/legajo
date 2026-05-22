import { l as esPreceptorODirectivo } from './authz-CrGwa8A2.js';
import { redirect, error } from '@sveltejs/kit';
import './db-DpfkJINj.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/preceptor/+layout.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, `/auth?redirect=${encodeURIComponent(url.pathname)}`);
	if (!await esPreceptorODirectivo(locals.usuario.usuarioId)) error(403, "Esta sección es solo para preceptores y directivos");
	return { usuario: locals.usuario };
};

var _layout_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-gLumDaki.js')).default;
const server_id = "src/routes/preceptor/+layout.server.ts";
const imports = ["_app/immutable/nodes/3.DsTTDyoS.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/OxspwgFg.js","_app/immutable/chunks/CTSaFKi3.js","_app/immutable/chunks/BEDIq91W.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=3-DSa7z3rE.js.map
