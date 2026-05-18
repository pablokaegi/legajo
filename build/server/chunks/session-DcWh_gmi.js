import { b as private_env } from './shared-server-9-2j12mp.js';
import { d as db, u as usuarios, a as sessions, r as roles } from './db-D9cZesji.js';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { timingSafeEqual, createHmac, randomBytes } from 'node:crypto';

//#region src/lib/server/session.ts
var SESSION_TTL_HOURS = 8;
function getSecret() {
	const secret = private_env.SESSION_SECRET;
	if (!secret || secret.length < 32) throw new Error("[legajo] SESSION_SECRET no esta configurado o es demasiado corto (minimo 32 caracteres)");
	return secret;
}
function sign(payload) {
	return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}
function makeCookieValue(id) {
	return `${id}.${sign(id)}`;
}
function parseCookieValue(cookie) {
	const dotIndex = cookie.lastIndexOf(".");
	if (dotIndex === -1) return null;
	const id = cookie.substring(0, dotIndex);
	const sig = cookie.substring(dotIndex + 1);
	if (id.length !== 64 || !/^[0-9a-f]+$/.test(id)) return null;
	const expected = sign(id);
	const a = Buffer.from(expected);
	const b = Buffer.from(sig);
	if (a.length !== b.length) return null;
	if (!timingSafeEqual(a, b)) return null;
	return id;
}
async function createSession(usuarioId, meta = {}) {
	const id = randomBytes(32).toString("hex");
	const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1e3);
	await db.insert(sessions).values({
		id,
		usuarioId,
		expiresAt,
		ipAddress: meta.ip ?? null,
		userAgent: meta.userAgent ? meta.userAgent.slice(0, 255) : null
	});
	return {
		cookieValue: makeCookieValue(id),
		expiresAt
	};
}
async function loadSession(cookie) {
	const id = parseCookieValue(cookie);
	if (!id) return null;
	const row = (await db.select({
		sessionId: sessions.id,
		usuarioId: usuarios.id,
		email: usuarios.email,
		nombre: usuarios.nombre,
		activo: usuarios.activo
	}).from(sessions).innerJoin(usuarios, eq(usuarios.id, sessions.usuarioId)).where(and(eq(sessions.id, id), gt(sessions.expiresAt, /* @__PURE__ */ new Date()), isNull(sessions.revokedAt))).limit(1))[0];
	if (!row || !row.activo) return null;
	const rolesRows = await db.select({ rol: roles.rol }).from(roles).where(eq(roles.usuarioId, row.usuarioId));
	return {
		sessionId: row.sessionId,
		usuarioId: row.usuarioId,
		email: row.email,
		nombre: row.nombre,
		roles: rolesRows.map((r) => r.rol)
	};
}
async function revokeSession(id) {
	await db.update(sessions).set({ revokedAt: /* @__PURE__ */ new Date() }).where(and(eq(sessions.id, id), isNull(sessions.revokedAt)));
}
var SESSION_COOKIE_NAME = "legajo_session";
var SESSION_TTL_SECONDS = SESSION_TTL_HOURS * 60 * 60;

export { SESSION_COOKIE_NAME as S, SESSION_TTL_SECONDS as a, createSession as c, loadSession as l, revokeSession as r };
//# sourceMappingURL=session-DcWh_gmi.js.map
