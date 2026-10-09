import { o as esAdmin } from './authz-C5Ea-Q2l.js';
import { b as listarAlumnosDeCurso } from './cursos2-Cc2qqGmd.js';
import { e as eliminarSesion, b as eliminarTodosLosVotos, g as generarVotosAleatorios, d as modoDe, f as eliminarVoto, q as quitarTokenVoto, h as generarTokenVoto, i as editarSesion, a as puedeGestionarSesion, j as listarVotos } from './agrupamientos-BUFwUcKw.js';
import { a as exigirSesion } from './acceso-BnjYBavC.js';
import { redirect, error, fail } from '@sveltejs/kit';
import './db-BCTfN-Zz.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './client-Cx69VD9U.js';
import 'node:crypto';

//#region src/routes/agrupamientos/[id]/+page.server.ts
var load = async ({ locals, params }) => {
	const { sesion, usuarioId } = await exigirSesion(locals.usuario, params.id, "ver");
	return {
		sesion,
		roster: (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => [])).map((u) => ({
			id: u.id,
			nombre: u.fullname
		})),
		votos: await listarVotos(sesion.id),
		puedeGestionar: await puedeGestionarSesion(usuarioId, sesion),
		puedeSimular: await esAdmin(usuarioId),
		modo: modoDe(sesion)
	};
};
var actions = {
	editarSesion: async ({ request, locals, params }) => {
		const { sesion } = await exigirSesion(locals.usuario, params.id, "gestionar");
		const fd = await request.formData();
		const titulo = fd.get("titulo")?.trim();
		const fecha = fd.get("fecha")?.trim();
		const notas = fd.get("notas")?.trim() || null;
		const nom = modoDe(sesion) === "nominacion";
		const cantRaw = parseInt(fd.get("cantidadEvaluar") ?? "", 10);
		const cantidadEvaluar = isNaN(cantRaw) ? sesion.cantidadEvaluar : Math.max(1, Math.min(nom ? 5 : 10, cantRaw));
		const permiteBloqueo = fd.get("permiteBloqueo") === "1";
		if (!titulo || !fecha) return fail(400, { error: "Completá el título y la fecha." });
		await editarSesion(sesion.id, {
			titulo,
			fecha,
			notas,
			cantidadEvaluar,
			permiteBloqueo
		});
		return { ok: true };
	},
	cambiarEstado: async ({ request, locals, params }) => {
		const { sesion } = await exigirSesion(locals.usuario, params.id, "gestionar");
		const estado = (await request.formData()).get("estado")?.toString() === "cerrada" ? "cerrada" : "abierta";
		await editarSesion(sesion.id, { estado });
		return { ok: true };
	},
	generarToken: async ({ locals, params }) => {
		const { sesion } = await exigirSesion(locals.usuario, params.id, "gestionar");
		await generarTokenVoto(sesion.id);
		return { ok: true };
	},
	quitarToken: async ({ locals, params }) => {
		const { sesion } = await exigirSesion(locals.usuario, params.id, "gestionar");
		await quitarTokenVoto(sesion.id);
		return { ok: true };
	},
	eliminarVoto: async ({ request, locals, params }) => {
		const { sesion } = await exigirSesion(locals.usuario, params.id, "gestionar");
		const fd = await request.formData();
		const votoId = parseInt(fd.get("votoId")?.toString() ?? "0", 10);
		if (votoId) await eliminarVoto(sesion.id, votoId);
		return { ok: true };
	},
	generarAleatorio: async ({ locals, params }) => {
		const { sesion, usuarioId } = await exigirSesion(locals.usuario, params.id, "gestionar");
		if (!await esAdmin(usuarioId)) error(403, "Solo un administrador puede generar votos de prueba.");
		const roster = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => [])).map((u) => ({
			id: u.id,
			nombre: u.fullname
		}));
		return {
			ok: true,
			generados: await generarVotosAleatorios(sesion.id, roster, sesion.cantidadEvaluar, modoDe(sesion))
		};
	},
	vaciarVotos: async ({ locals, params }) => {
		const { sesion } = await exigirSesion(locals.usuario, params.id, "gestionar");
		await eliminarTodosLosVotos(sesion.id);
		return { ok: true };
	},
	eliminarSesion: async ({ locals, params }) => {
		const { sesion } = await exigirSesion(locals.usuario, params.id, "gestionar");
		await eliminarSesion(sesion.id);
		throw redirect(303, "/agrupamientos");
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 13;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-D5Oa8WSd.js')).default;
const server_id = "src/routes/agrupamientos/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/13.Dn8npDHV.js","_app/immutable/chunks/t-k1TNGg.js","_app/immutable/chunks/CebVd6hW.js","_app/immutable/chunks/BrlbreWn.js","_app/immutable/chunks/D-bgPNjy.js","_app/immutable/chunks/C4topKbu.js","_app/immutable/chunks/DYR6MKK2.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=13-BmHXl6id.js.map
