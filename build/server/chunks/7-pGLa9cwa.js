import { q as esPreceptorODirectivo, j as alcancePreceptoria } from './authz-BVdVv-6k.js';
import { redirect, error } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
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
	return {
		usuario: locals.usuario,
		puedeReincorporar: await alcancePreceptoria(locals.usuario.usuarioId) === null
	};
};

var _layout_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 7;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-CPmJpRgn.js')).default;
const server_id = "src/routes/preceptor/+layout.server.ts";
const imports = ["_app/immutable/nodes/7.Dwffw_Z9.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/4WnCJOoR.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=7-pGLa9cwa.js.map
