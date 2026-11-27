import { d as db, u as usuarios, s as sessions, r as roles } from './db-CLN6I8p_.js';
import { t as alcanceCurso, u as idCursoDeAlcance } from './authz-BVdVv-6k.js';
import { r as registrarAccion, i as ipDe } from './audit-Dz9I-BN1.js';
import { a as listarCursos } from './cursos2-pDrqIz-A.js';
import { h as hashPin } from './auth-DfToYwV7.js';
import { fail, redirect, error } from '@sveltejs/kit';
import { eq, and, inArray } from 'drizzle-orm';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './client-Dsrb4zGp.js';
import './rest-qugARKMk.js';
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
		rol: roles.rol,
		scope: roles.scope
	}).from(roles)]);
	return us.map((u) => {
		const asignados = rs.filter((r) => r.usuarioId === u.id);
		const porRol = (rol) => asignados.filter((r) => r.rol === rol).map((r) => idCursoDeAlcance(r.scope)).filter((id) => id !== null);
		return {
			...u,
			roles: [...new Set(asignados.map((r) => r.rol))],
			cursosDocente: porRol("docente"),
			cursosPreceptor: porRol("preceptor"),
			preceptorInstitucional: asignados.some((r) => r.rol === "preceptor") && asignados.every((r) => r.rol !== "preceptor" || r.scope === null)
		};
	});
}
/** Reemplaza el alcance de un rol existente y conserva los otros roles de la cuenta. */
async function actualizarCursosDeRol(usuarioId, rol, ids) {
	return db.transaction(async (tx) => {
		const [usuario] = await tx.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.id, usuarioId)).for("update");
		if (!usuario) return false;
		const condicion = and(eq(roles.usuarioId, usuarioId), eq(roles.rol, rol));
		const [actual] = await tx.select({ rol: roles.rol }).from(roles).where(condicion).limit(1);
		if (!actual) return false;
		await tx.delete(roles).where(condicion);
		const scopes = ids.length ? ids.map(alcanceCurso) : [null];
		await tx.insert(roles).values(scopes.map((scope) => ({
			usuarioId,
			rol,
			scope
		})));
		return true;
	});
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
	const yoId = exigirAdmin(locals.usuario);
	const [usuarios, cursos] = await Promise.all([listarUsuariosConRoles(), listarCursos().catch(() => null)]);
	return {
		usuarios,
		cursos: cursos?.map((c) => ({
			id: c.id,
			nombre: c.displayname || c.fullname
		})) ?? null,
		rolesDisponibles: ROLES_GESTIONABLES,
		yoId
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
	cursos: async ({ request, locals }) => {
		const adminId = exigirAdmin(locals.usuario);
		const fd = await request.formData();
		const usuarioId = Number(fd.get("usuarioId"));
		const rol = fd.get("rol");
		if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) return fail(400, { error: "Usuario inválido." });
		if (rol !== "docente" && rol !== "preceptor") return fail(400, { error: "Rol inválido." });
		const institucional = rol === "preceptor" && fd.get("institucional") === "1";
		const ids = institucional ? [] : [...new Set(fd.getAll("curso").map(Number))];
		if (rol === "preceptor" && !institucional && ids.length === 0) return fail(400, { error: "Elegí algún curso o indicá expresamente acceso institucional." });
		if (ids.length) {
			const cursos = await listarCursos().catch(() => null);
			if (cursos === null) return fail(503, { error: "No se pudo verificar los cursos en Moodle." });
			const disponibles = new Set(cursos.map((c) => c.id));
			if (ids.some((id) => !disponibles.has(id))) return fail(400, { error: "Hay cursos inválidos." });
		}
		if (!await actualizarCursosDeRol(usuarioId, rol, ids)) return fail(400, { error: "La cuenta debe tener ese rol." });
		await registrarAccion({
			usuarioId: adminId,
			accion: "usuario.cursos",
			tablaDestino: "usuarios",
			idDestino: usuarioId,
			payload: {
				rol,
				cursos: ids,
				institucional
			},
			ip: ipDe(request)
		});
		return { ok: "Alcance actualizado." };
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
const component = async () => component_cache ??= (await import('./_page.svelte-tczKnLxw.js')).default;
const server_id = "src/routes/admin/usuarios/+page.server.ts";
const imports = ["_app/immutable/nodes/12.Cxa-G6vL.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/B8RcQQp0.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/M6KOCQrT.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=12-BOR4uloT.js.map
