import { d as db, u as usuarios, s as sessions, r as roles } from './db-DeyHlLbL.js';
import { r as registrarAccion, i as ipDe } from './audit-QNN2zM9t.js';
import { h as hashPin } from './auth-CIbo1M3X.js';
import { fail, redirect, error } from '@sveltejs/kit';
import { eq, and, inArray } from 'drizzle-orm';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'bcryptjs';

//#region src/lib/server/services/usuarios.ts
/** Roles que se administran desde la pantalla (el de familia va por vínculos). */
var ROLES_GESTIONABLES = [
	"admin",
	"directivo",
	"preceptor",
	"docente",
	"gabinete"
];
var PIN_VALIDO = /^\d{6,8}$/;
var EMAIL_VALIDO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
async function listarUsuariosConRoles() {
	const [us, rs] = await Promise.all([db.select({
		id: usuarios.id,
		nombre: usuarios.nombre,
		email: usuarios.email,
		activo: usuarios.activo
	}).from(usuarios).orderBy(usuarios.nombre), db.select({
		usuarioId: roles.usuarioId,
		rol: roles.rol
	}).from(roles)]);
	return us.map((u) => ({
		...u,
		roles: [...new Set(rs.filter((r) => r.usuarioId === u.id).map((r) => r.rol))]
	}));
}
async function crearUsuario(data) {
	const pinHash = await hashPin(data.pin);
	const [res] = await db.insert(usuarios).values({
		nombre: data.nombre,
		email: data.email.toLowerCase(),
		pinHash,
		activo: true
	});
	const id = Number(res.insertId);
	if (data.roles.length > 0) await db.insert(roles).values(data.roles.map((rol) => ({
		usuarioId: id,
		rol,
		scope: null
	})));
	return id;
}
/** Deja exactamente esos roles (de los gestionables); no toca otros roles. */
async function actualizarRoles(usuarioId, nuevos) {
	const actuales = await db.select({ rol: roles.rol }).from(roles).where(eq(roles.usuarioId, usuarioId));
	const tiene = new Set(actuales.map((r) => r.rol));
	const quitar = ROLES_GESTIONABLES.filter((r) => tiene.has(r) && !nuevos.includes(r));
	const agregar = nuevos.filter((r) => !tiene.has(r));
	if (quitar.length > 0) await db.delete(roles).where(and(eq(roles.usuarioId, usuarioId), inArray(roles.rol, quitar)));
	if (agregar.length > 0) await db.insert(roles).values(agregar.map((rol) => ({
		usuarioId,
		rol,
		scope: null
	})));
	return {
		quitar,
		agregar
	};
}
async function resetearPin(usuarioId, pin) {
	await db.update(usuarios).set({ pinHash: await hashPin(pin) }).where(eq(usuarios.id, usuarioId));
	await db.update(sessions).set({ revokedAt: /* @__PURE__ */ new Date() }).where(eq(sessions.usuarioId, usuarioId));
}
async function cambiarActivo(usuarioId, activo) {
	await db.update(usuarios).set({ activo }).where(eq(usuarios.id, usuarioId));
	if (!activo) await db.update(sessions).set({ revokedAt: /* @__PURE__ */ new Date() }).where(eq(sessions.usuarioId, usuarioId));
}
//#endregion
//#region src/routes/admin/usuarios/+page.server.ts
function exigirAdmin(usuario) {
	if (!usuario) throw redirect(303, "/auth");
	if (!usuario.roles.includes("admin")) error(403, "Solo administradores.");
	return usuario.usuarioId;
}
function rolesDelForm(fd) {
	const pedidos = fd.getAll("rol").map(String);
	return ROLES_GESTIONABLES.filter((r) => pedidos.includes(r));
}
var load = async ({ locals }) => {
	exigirAdmin(locals.usuario);
	return {
		usuarios: await listarUsuariosConRoles(),
		rolesDisponibles: ROLES_GESTIONABLES,
		yoId: locals.usuario.usuarioId
	};
};
var actions = {
	crear: async ({ request, locals }) => {
		const adminId = exigirAdmin(locals.usuario);
		const fd = await request.formData();
		const nombre = String(fd.get("nombre") ?? "").trim().slice(0, 100);
		const email = String(fd.get("email") ?? "").trim().toLowerCase();
		const pin = String(fd.get("pin") ?? "").trim();
		const roles = rolesDelForm(fd);
		if (!nombre) return fail(400, { error: "Falta el nombre." });
		if (!EMAIL_VALIDO.test(email)) return fail(400, { error: "Email inválido." });
		if (!PIN_VALIDO.test(pin)) return fail(400, { error: "El PIN tiene que tener entre 6 y 8 dígitos." });
		if (roles.length === 0) return fail(400, { error: "Elegí al menos un rol." });
		try {
			await registrarAccion({
				usuarioId: adminId,
				accion: "usuario.crear",
				tablaDestino: "usuarios",
				idDestino: await crearUsuario({
					nombre,
					email,
					pin,
					roles
				}),
				payload: {
					email,
					roles
				},
				ip: ipDe(request)
			});
		} catch (e) {
			if ((e?.code ?? e?.cause?.code) === "ER_DUP_ENTRY") return fail(400, { error: "Ya existe una cuenta con ese email." });
			throw e;
		}
		return { ok: `Cuenta creada para ${email}.` };
	},
	roles: async ({ request, locals }) => {
		const adminId = exigirAdmin(locals.usuario);
		const fd = await request.formData();
		const usuarioId = Number(fd.get("usuarioId"));
		if (!Number.isInteger(usuarioId) || usuarioId <= 0) return fail(400, { error: "Usuario inválido." });
		const roles = rolesDelForm(fd);
		if (usuarioId === adminId && !roles.includes("admin")) return fail(400, { error: "No podés quitarte a vos mismo el rol de admin." });
		await registrarAccion({
			usuarioId: adminId,
			accion: "usuario.roles",
			tablaDestino: "usuarios",
			idDestino: usuarioId,
			payload: await actualizarRoles(usuarioId, roles),
			ip: ipDe(request)
		});
		return { ok: "Roles actualizados." };
	},
	pin: async ({ request, locals }) => {
		const adminId = exigirAdmin(locals.usuario);
		const fd = await request.formData();
		const usuarioId = Number(fd.get("usuarioId"));
		const pin = String(fd.get("pin") ?? "").trim();
		if (!Number.isInteger(usuarioId) || usuarioId <= 0) return fail(400, { error: "Usuario inválido." });
		if (!PIN_VALIDO.test(pin)) return fail(400, { error: "El PIN tiene que tener entre 6 y 8 dígitos." });
		await resetearPin(usuarioId, pin);
		await registrarAccion({
			usuarioId: adminId,
			accion: "usuario.reset_pin",
			tablaDestino: "usuarios",
			idDestino: usuarioId,
			ip: ipDe(request)
		});
		if (usuarioId === adminId) throw redirect(303, "/auth");
		return { ok: "PIN actualizado. Las sesiones abiertas de esa cuenta se cerraron." };
	},
	activo: async ({ request, locals }) => {
		const adminId = exigirAdmin(locals.usuario);
		const fd = await request.formData();
		const usuarioId = Number(fd.get("usuarioId"));
		const activo = fd.get("activo") === "1";
		if (!Number.isInteger(usuarioId) || usuarioId <= 0) return fail(400, { error: "Usuario inválido." });
		if (usuarioId === adminId && !activo) return fail(400, { error: "No podés desactivar tu propia cuenta." });
		await cambiarActivo(usuarioId, activo);
		await registrarAccion({
			usuarioId: adminId,
			accion: activo ? "usuario.activar" : "usuario.desactivar",
			tablaDestino: "usuarios",
			idDestino: usuarioId,
			ip: ipDe(request)
		});
		return { ok: activo ? "Cuenta activada." : "Cuenta desactivada y sesiones cerradas." };
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 12;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-bnX7-Yv6.js')).default;
const server_id = "src/routes/admin/usuarios/+page.server.ts";
const imports = ["_app/immutable/nodes/12.CVxdGKDL.js","_app/immutable/chunks/BUJoxPBc.js","_app/immutable/chunks/BFfF0FqC.js","_app/immutable/chunks/3l6Q5lPp.js","_app/immutable/chunks/D-v2tPeI.js","_app/immutable/chunks/C8H49NTu.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=12-k67leDIU.js.map
