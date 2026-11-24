import { S as SESSION_COOKIE_NAME, l as loadSession } from './session-BHrJzTvE.js';
import { C as initDb } from './db-D7hI4G6x.js';
import { p as private_env } from './index.js-D6_LEqEo.js';
import 'drizzle-orm';
import 'node:crypto';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import '@sveltejs/kit/internal';
import '@sveltejs/kit';
import '@sveltejs/kit/internal/server';

// src/hooks.server.ts
async function init() {
	await initDb();
}
var handle = async ({ event, resolve }) => {
	const cookie = event.cookies.get(SESSION_COOKIE_NAME);
	if (cookie) {
		try {
			event.locals.usuario = await loadSession(cookie);
		} catch (err) {
			console.error("[legajo] Error al cargar sesion:", err);
			event.locals.usuario = null;
		}
		if (!event.locals.usuario) event.cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
	} else event.locals.usuario = null;
	const response = await resolve(event);
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("X-Frame-Options", "DENY");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	response.headers.set("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");
	if (private_env.NODE_ENV === "production") response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
	return response;
};

export { handle, init };
//# sourceMappingURL=hooks.server-BO3EcPR-.js.map
