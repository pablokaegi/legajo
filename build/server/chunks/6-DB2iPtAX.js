import { d as db, u as usuarios, r as roles, s as sessions } from './db-BwfbdrtT.js';
import { and, gt, isNull } from 'drizzle-orm';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';

//#region src/routes/admin/+page.server.ts
var load = async () => {
	const [usuariosRows, rolesRows, sesionesActivas] = await Promise.all([
		db.select({
			id: usuarios.id,
			activo: usuarios.activo
		}).from(usuarios),
		db.select({ rol: roles.rol }).from(roles),
		db.select({ id: sessions.id }).from(sessions).where(and(gt(sessions.expiresAt, /* @__PURE__ */ new Date()), isNull(sessions.revokedAt)))
	]);
	const porRol = {};
	for (const r of rolesRows) porRol[r.rol] = (porRol[r.rol] ?? 0) + 1;
	return {
		totalUsuarios: usuariosRows.length,
		usuariosActivos: usuariosRows.filter((u) => u.activo).length,
		sesionesActivas: sesionesActivas.length,
		porRol
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 6;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Bmq1aDC4.js')).default;
const server_id = "src/routes/admin/+page.server.ts";
const imports = ["_app/immutable/nodes/6.D6W4z-bR.js","_app/immutable/chunks/85pPpyzY.js","_app/immutable/chunks/BaKrtv6m.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=6-DB2iPtAX.js.map
