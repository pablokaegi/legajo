import { x as esAdmin } from './authz-BVdVv-6k.js';
import { b as listarAlumnosDeCurso } from './cursos2-pDrqIz-A.js';
import { q as eliminarSesion, s as editarSesion, t as eliminarTodosLosVotos, u as generarVotosAleatorios, f as modoDe, v as eliminarVoto, w as quitarTokenVoto, x as generarTokenVoto, g as listarVotos, c as puedeGestionarSesion, y as contarSesionesDelCurso } from './agrupamientos-f9JamgYJ.js';
import { a as exigirSesion } from './acceso2-CDk--U70.js';
import { p as parsePrediccion } from './sintonia-3BS8uGlU.js';
import { redirect, fail, error } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './client-Dsrb4zGp.js';
import './rest-qugARKMk.js';
import 'node:crypto';

//#region src/routes/agrupamientos/[id]/+page.server.ts
var load = async ({ locals, params }) => {
	const { sesion, usuarioId } = await exigirSesion(locals.usuario, params.id, "ver");
	const roster = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => [])).map((u) => ({
		id: u.id,
		nombre: u.fullname
	}));
	const votos = await listarVotos(sesion.id);
	const puedeGestionar = await puedeGestionarSesion(usuarioId, sesion);
	const puedeSimular = await esAdmin(usuarioId);
	return {
		sesion: {
			...sesion,
			votoToken: puedeGestionar ? sesion.votoToken : null
		},
		roster,
		votos,
		puedeGestionar,
		puedeSimular,
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

const index = 16;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B-tenUCK.js')).default;
const server_id = "src/routes/agrupamientos/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/16.D7XTYruN.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/B8RcQQp0.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/M6KOCQrT.js","_app/immutable/chunks/4WnCJOoR.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=16-qQgO0mMF.js.map
