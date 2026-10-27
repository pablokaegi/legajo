import { a as listarCursos } from './cursos2-COBKiQyR.js';
import './client-BlwuPSaS.js';
import './shared-server-asDUS7ug.js';
import './db-jrdBeEUG.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/pizarra/+page.server.ts
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
const component = async () => component_cache ??= (await import('./_page.svelte-ClwwRIaR.js')).default;
const server_id = "src/routes/pizarra/+page.server.ts";
const imports = ["_app/immutable/nodes/47.BU1cWsz2.js","_app/immutable/chunks/CcZ_XLq7.js","_app/immutable/chunks/6xwAJV1g.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=47-BnlfTDpO.js.map
