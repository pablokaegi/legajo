import { b as listarAlumnosDeCurso } from './cursos2-BV1UQDP7.js';
import { e as eliminarSesion, a as eliminarTodosLosVotos, o as obtenerSesion, g as generarVotosAleatorios, b as eliminarVoto, q as quitarTokenVoto, d as generarTokenVoto, f as editarSesion, h as listarVotos } from './agrupamientos-BFNT9uir.js';
import { redirect, fail, error } from '@sveltejs/kit';
import './client-CZ7i8Obi.js';
import './shared-server-asDUS7ug.js';
import './db-BwwlYHWL.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'node:crypto';

//#region src/routes/institucional/agrupamientos/[id]/+page.server.ts
var load = async ({ locals, params }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const id = parseInt(params.id, 10);
	if (isNaN(id)) error(400, "ID inválido");
	const sesion = await obtenerSesion(id);
	if (!sesion) error(404, "Sesión no encontrada");
	return {
		sesion,
		roster: (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => [])).map((u) => ({
			id: u.id,
			nombre: u.fullname
		})),
		votos: await listarVotos(id)
	};
};
var actions = {
	editarSesion: async ({ request, locals, params }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		const id = parseInt(params.id, 10);
		const fd = await request.formData();
		const titulo = fd.get("titulo")?.trim();
		const fecha = fd.get("fecha")?.trim();
		const notas = fd.get("notas")?.trim() || null;
		const cantRaw = parseInt(fd.get("cantidadEvaluar") ?? "5", 10);
		const cantidadEvaluar = isNaN(cantRaw) ? 5 : Math.max(1, Math.min(10, cantRaw));
		if (!titulo || !fecha) return fail(400, { error: "Completá el título y la fecha." });
		await editarSesion(id, {
			titulo,
			fecha,
			notas,
			cantidadEvaluar
		});
		return { ok: true };
	},
	cambiarEstado: async ({ request, locals, params }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		await editarSesion(parseInt(params.id, 10), { estado: (await request.formData()).get("estado")?.toString() === "cerrada" ? "cerrada" : "abierta" });
		return { ok: true };
	},
	generarToken: async ({ locals, params }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		await generarTokenVoto(parseInt(params.id, 10));
		return { ok: true };
	},
	quitarToken: async ({ locals, params }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		await quitarTokenVoto(parseInt(params.id, 10));
		return { ok: true };
	},
	eliminarVoto: async ({ request, locals }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		const fd = await request.formData();
		const votoId = parseInt(fd.get("votoId")?.toString() ?? "0", 10);
		if (votoId) await eliminarVoto(votoId);
		return { ok: true };
	},
	generarAleatorio: async ({ locals, params }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		const id = parseInt(params.id, 10);
		const sesion = await obtenerSesion(id);
		if (!sesion) return fail(404, { error: "Sesión no encontrada." });
		return {
			ok: true,
			generados: await generarVotosAleatorios(id, (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => [])).map((u) => ({
				id: u.id,
				nombre: u.fullname
			})), sesion.cantidadEvaluar)
		};
	},
	vaciarVotos: async ({ locals, params }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		await eliminarTodosLosVotos(parseInt(params.id, 10));
		return { ok: true };
	},
	eliminarSesion: async ({ locals, params }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		await eliminarSesion(parseInt(params.id, 10));
		throw redirect(303, "/institucional/agrupamientos");
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 14;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BPKFSW2P.js')).default;
const server_id = "src/routes/institucional/agrupamientos/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/14.DenxSvKB.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/DuCIje9Q.js","_app/immutable/chunks/8j8Ckqxp.js","_app/immutable/chunks/CdACnDVz.js","_app/immutable/chunks/BbwDwJoj.js","_app/immutable/chunks/BEDIq91W.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=14-B0EAJ6bA.js.map
