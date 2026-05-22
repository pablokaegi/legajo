import { d as db, u as usuarios, s as sessions } from './db-BwfbdrtT.js';
import { eq, desc } from 'drizzle-orm';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';

//#region src/routes/admin/conectados/+page.server.ts
var load = async () => {
	const rows = await db.select({
		sessionId: sessions.id,
		createdAt: sessions.createdAt,
		expiresAt: sessions.expiresAt,
		revokedAt: sessions.revokedAt,
		ip: sessions.ipAddress,
		userAgent: sessions.userAgent,
		nombre: usuarios.nombre,
		email: usuarios.email
	}).from(sessions).innerJoin(usuarios, eq(usuarios.id, sessions.usuarioId)).orderBy(desc(sessions.createdAt)).limit(60);
	const ahora = Date.now();
	return { conexiones: rows.map((r) => ({
		createdAt: r.createdAt,
		ip: r.ip,
		userAgent: r.userAgent,
		nombre: r.nombre,
		email: r.email,
		activa: !r.revokedAt && new Date(r.expiresAt).getTime() > ahora
	})) };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 7;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CApftkgY.js')).default;
const server_id = "src/routes/admin/conectados/+page.server.ts";
const imports = ["_app/immutable/nodes/7.DTAu7Dud.js","_app/immutable/chunks/85pPpyzY.js","_app/immutable/chunks/BaKrtv6m.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=7-CUI5tuKK.js.map
