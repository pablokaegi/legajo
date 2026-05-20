import { e as esPreceptorODirectivo } from './authz-B6Un7KRR.js';
import { redirect, error } from '@sveltejs/kit';
import './db-XKMgjins.js';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
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

const index = 2;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-BsDN-SRc.js')).default;
const server_id = "src/routes/preceptor/+layout.server.ts";
const imports = ["_app/immutable/nodes/2.DlniRo_d.js","_app/immutable/chunks/BCmZRGrY.js","_app/immutable/chunks/DwEWDp_2.js","_app/immutable/chunks/D94pSqh2.js","_app/immutable/chunks/2TU3FloQ.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=2-CGreRnYl.js.map
