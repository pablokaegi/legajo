import { p as private_env } from './index.js-D6_LEqEo.js';
import { v as verifyPin } from './auth-5HTKZdvP.js';
import { r as revokeSession, S as SESSION_COOKIE_NAME, c as createSession, a as SESSION_TTL_SECONDS } from './session-BHrJzTvE.js';
import { redirect, fail } from '@sveltejs/kit';
import { z } from 'zod';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';
import './db-D7hI4G6x.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'bcryptjs';
import 'node:crypto';

// src/routes/auth/+page.server.ts
var MAX_ATTEMPTS = 5;
var LOCK_MS = 9e5;
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
			const remaining = Math.max(0, MAX_ATTEMPTS - (record?.count ?? 0));
			return fail(401, {
				error: `Email o PIN incorrecto. Intentos restantes: ${remaining}.`,
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
		const redirectTo = url.searchParams.get("redirect") ?? "/";
		redirect(303, redirectTo);
	},
	logout: async ({ cookies, locals, request }) => {
		if (locals.usuario?.sessionId) await revokeSession(locals.usuario.sessionId);
		cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
		const fd = await request.formData().catch(() => null);
		redirect(303, fd?.get("volver") === "/pizarra" ? "/auth?redirect=%2Fpizarra" : "/auth");
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions
});

const index = 21;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-C_tTy7ML.js')).default;
const server_id = "src/routes/auth/+page.server.ts";
const imports = ["_app/immutable/nodes/21.6YKP97Hf.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js","_app/immutable/chunks/Bzau-lkd.js","_app/immutable/chunks/DeF1vw6K.js","_app/immutable/chunks/C0D3a8lr.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=21-c_-xYozg.js.map
