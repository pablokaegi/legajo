import { d as db, f as syncLogs, u as usuarios, l as logsAcciones } from './db-jrdBeEUG.js';
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

const index = 11;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BDx9IjC9.js')).default;
const server_id = "src/routes/admin/logs/+page.server.ts";
const imports = ["_app/immutable/nodes/11.BdQuO4Pw.js","_app/immutable/chunks/CcZ_XLq7.js","_app/immutable/chunks/6xwAJV1g.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=11-DDI32abh.js.map
