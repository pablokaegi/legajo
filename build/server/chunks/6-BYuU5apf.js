import { p as private_env } from './shared-server-asDUS7ug.js';
import { d as db, u as usuarios } from './db-jloi_eIm.js';
import { r as revokeSession, S as SESSION_COOKIE_NAME, c as createSession, a as SESSION_TTL_SECONDS } from './session-C3-H1U45.js';
import { redirect, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'node:crypto';

//#region src/lib/server/services/auth.ts
async function verifyPin(email, pin) {
	const usuario = (await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1))[0];
	if (!usuario || !usuario.activo) return null;
	if (!await bcrypt.compare(pin, usuario.pinHash)) return null;
	return {
		usuarioId: usuario.id,
		email: usuario.email,
		nombre: usuario.nombre
	};
}
//#endregion
//#region src/routes/auth/+page.server.ts
var MAX_ATTEMPTS = 5;
var LOCK_MS = 900 * 1e3;
var _global = globalThis;
var attempts = _global.__legajoAttempts ?? (_global.__legajoAttempts = /* @__PURE__ */ new Map());
function getRateLimit(email) {
	const now = Date.now();
	for (const [key, val] of attempts) if (now > val.lockedUntil) attempts.delete(key);
	const record = attempts.get(email);
	if (!record) return {
		blocked: false,
		retryInSec: 0
	};
	if (now < record.lockedUntil) return {
		blocked: true,
		retryInSec: Math.ceil((record.lockedUntil - now) / 1e3)
	};
	return {
		blocked: false,
		retryInSec: 0
	};
}
function recordFailedAttempt(email) {
	const now = Date.now();
	const existing = attempts.get(email);
	if (!existing || now > existing.lockedUntil) {
		attempts.set(email, {
			count: 1,
			lockedUntil: now + LOCK_MS * .1
		});
		return;
	}
	existing.count += 1;
	existing.lockedUntil = existing.count >= MAX_ATTEMPTS ? now + LOCK_MS : now + LOCK_MS * .1;
}
var LoginSchema = z.object({
	email: z.string().email("Email invalido"),
	pin: z.string().min(6, "PIN minimo 6 digitos").max(8, "PIN maximo 8 digitos").regex(/^\d+$/, "El PIN solo puede contener numeros")
});
var actions = {
	login: async ({ request, cookies, url, getClientAddress }) => {
		const formData = await request.formData();
		const raw = {
			email: formData.get("email"),
			pin: formData.get("pin")
		};
		const parsed = LoginSchema.safeParse(raw);
		if (!parsed.success) {
			const errors = parsed.error.flatten().fieldErrors;
			return fail(400, {
				error: Object.values(errors).flat()[0] ?? "Datos invalidos",
				email: String(raw.email ?? "")
			});
		}
		const email = parsed.data.email.toLowerCase();
		const { blocked, retryInSec } = getRateLimit(email);
		if (blocked) {
			const mins = Math.ceil(retryInSec / 60);
			return fail(429, {
				error: `Demasiados intentos. Espera ${mins} minuto${mins > 1 ? "s" : ""}.`,
				email: parsed.data.email
			});
		}
		const usuario = await verifyPin(email, parsed.data.pin);
		if (!usuario) {
			recordFailedAttempt(email);
			const record = attempts.get(email);
			return fail(401, {
				error: `Email o PIN incorrecto. Intentos restantes: ${Math.max(0, MAX_ATTEMPTS - (record?.count ?? 0))}.`,
				email: parsed.data.email
			});
		}
		attempts.delete(email);
		const ua = request.headers.get("user-agent") ?? void 0;
		let ip;
		try {
			ip = getClientAddress();
		} catch {
			ip = void 0;
		}
		const { cookieValue } = await createSession(usuario.usuarioId, {
			ip,
			userAgent: ua
		});
		cookies.set(SESSION_COOKIE_NAME, cookieValue, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: private_env.NODE_ENV === "production",
			maxAge: SESSION_TTL_SECONDS
		});
		redirect(303, url.searchParams.get("redirect") ?? "/");
	},
	logout: async ({ cookies, locals }) => {
		if (locals.usuario?.sessionId) await revokeSession(locals.usuario.sessionId);
		cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
		redirect(303, "/auth");
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions
});

const index = 6;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BLJhIxTt.js')).default;
const server_id = "src/routes/auth/+page.server.ts";
const imports = ["_app/immutable/nodes/6.BaatU3l_.js","_app/immutable/chunks/uSN3y40e.js","_app/immutable/chunks/tljmGKE2.js","_app/immutable/chunks/BVXZB_WR.js","_app/immutable/chunks/CebGqVuK.js","_app/immutable/chunks/B8WnZMYa.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=6-BYuU5apf.js.map
