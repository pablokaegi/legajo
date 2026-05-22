import { d as db, b as syncLogs, u as usuarios, w as logsAcciones } from './db-BwfbdrtT.js';
import { desc, eq } from 'drizzle-orm';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';

//#region src/routes/admin/logs/+page.server.ts
var load = async () => {
	const [sync, acciones] = await Promise.all([db.select().from(syncLogs).orderBy(desc(syncLogs.createdAt)).limit(80), db.select({
		id: logsAcciones.id,
		accion: logsAcciones.accion,
		tablaDestino: logsAcciones.tablaDestino,
		idDestino: logsAcciones.idDestino,
		ip: logsAcciones.ip,
		createdAt: logsAcciones.createdAt,
		usuarioNombre: usuarios.nombre
	}).from(logsAcciones).leftJoin(usuarios, eq(usuarios.id, logsAcciones.usuarioId)).orderBy(desc(logsAcciones.createdAt)).limit(80)]);
	return {
		sync,
		acciones
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 8;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DXUg7C_Y.js')).default;
const server_id = "src/routes/admin/logs/+page.server.ts";
const imports = ["_app/immutable/nodes/8.B5Zx5BUT.js","_app/immutable/chunks/85pPpyzY.js","_app/immutable/chunks/BaKrtv6m.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=8-UT3_hHlR.js.map
