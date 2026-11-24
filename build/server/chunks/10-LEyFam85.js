import { d as db, u as usuarios, i as sessions } from './db-D7hI4G6x.js';
import { eq, desc } from 'drizzle-orm';
import './index.js-D6_LEqEo.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit';
import '@sveltejs/kit/internal/server';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';

// src/routes/admin/conectados/+page.server.ts
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

const index = 10;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Cf1LINfV.js')).default;
const server_id = "src/routes/admin/conectados/+page.server.ts";
const imports = ["_app/immutable/nodes/10.rj0g0YQK.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=10-LEyFam85.js.map
