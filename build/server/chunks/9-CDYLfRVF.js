import { d as db, j as syncLogs, u as usuarios, w as logsAcciones } from './db-BCTfN-Zz.js';
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

const index = 9;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DXUg7C_Y.js')).default;
const server_id = "src/routes/admin/logs/+page.server.ts";
const imports = ["_app/immutable/nodes/9.B5xV_h94.js","_app/immutable/chunks/Bub9jyPb.js","_app/immutable/chunks/DYR6MKK2.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=9-CDYLfRVF.js.map
