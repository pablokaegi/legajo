import { d as db, u as usuarios, r as roles, i as sessions } from './db-D7hI4G6x.js';
import { and, gt, isNull } from 'drizzle-orm';
import './index.js-D6_LEqEo.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit';
import '@sveltejs/kit/internal/server';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';

// src/routes/admin/+page.server.ts
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

const index = 9;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Dil5YMkP.js')).default;
const server_id = "src/routes/admin/+page.server.ts";
const imports = ["_app/immutable/nodes/9.n8rgxq_d.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=9-DSy2t6aC.js.map
