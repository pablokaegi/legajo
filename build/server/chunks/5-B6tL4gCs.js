import { b as esPreceptorODirectivo } from './authz-C29w6V7D.js';
import { redirect, error } from '@sveltejs/kit';
import './db-CnhT25Eo.js';
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

const index = 5;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-X5ZctGzo.js')).default;
const server_id = "src/routes/preceptor/+layout.server.ts";
const imports = ["_app/immutable/nodes/5.DSB424cz.js","_app/immutable/chunks/BYJUstCy.js","_app/immutable/chunks/CLHN2XE7.js","_app/immutable/chunks/CR-wpuFV.js","_app/immutable/chunks/BD-4OuCl.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=5-B6tL4gCs.js.map
