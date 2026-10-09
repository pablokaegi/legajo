import { o as esAdmin } from './authz-C29w6V7D.js';
import { b as listarAlumnosDeCurso } from './cursos2-CO8sxrLe.js';
import { i as eliminarSesion, j as editarSesion, k as eliminarTodosLosVotos, n as generarVotosAleatorios, f as modoDe, q as eliminarVoto, r as quitarTokenVoto, s as generarTokenVoto, t as contarSesionesDelCurso, a as puedeGestionarSesion, c as listarVotos } from './agrupamientos-Bz0E4k6X.js';
import { a as exigirSesion } from './acceso-1KCvqAgn.js';
import { p as parsePrediccion } from './sintonia-3BS8uGlU.js';
import { redirect, fail, error } from '@sveltejs/kit';
import './db-CnhT25Eo.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './client-Bg6wabNy.js';
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
		modo: modoDe(sesion),
		prediccion: parsePrediccion(sesion.prediccionJson),
		sesionesDelCurso: await contarSesionesDelCurso(sesion.cursoMoodleId)
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
	guardarPrediccion: async ({ request, locals, params }) => {
		const { sesion } = await exigirSesion(locals.usuario, params.id, "gestionar");
		const fd = await request.formData();
		const roster = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => [])).map((u) => u.id);
		const enCurso = new Set(roster);
		const ids = (k) => [...new Set(fd.getAll(k).map((v) => Number(v)))].filter((n) => enCurso.has(n)).slice(0, 6);
		const menosElegidos = ids("menos");
		const masElegidos = ids("mas");
		if (menosElegidos.length === 0 && masElegidos.length === 0) return fail(400, { error: "Marcá al menos un alumno en la predicción." });
		await editarSesion(sesion.id, { prediccionJson: JSON.stringify({
			menosElegidos,
			masElegidos,
			fecha: (/* @__PURE__ */ new Date()).toISOString()
		}) });
		return { ok: true };
	},
	borrarPrediccion: async ({ locals, params }) => {
		const { sesion } = await exigirSesion(locals.usuario, params.id, "gestionar");
		await editarSesion(sesion.id, { prediccionJson: null });
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

const index = 14;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Bis9zO-g.js')).default;
const server_id = "src/routes/agrupamientos/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/14.BQh7z9KM.js","_app/immutable/chunks/BYJUstCy.js","_app/immutable/chunks/CCk5Sv82.js","_app/immutable/chunks/CR-wpuFV.js","_app/immutable/chunks/Bjj7Tq4D.js","_app/immutable/chunks/CLHN2XE7.js","_app/immutable/chunks/BD-4OuCl.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=14-CQHc_0qE.js.map
