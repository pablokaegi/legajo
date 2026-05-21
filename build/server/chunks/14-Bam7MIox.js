import { a as listarAlumnosDeCurso } from './cursos2-CPrTViO2.js';
import { e as eliminarSesion, a as editarSesion, b as eliminarVoto, g as guardarVoto, o as obtenerSesion, d as listarVotos } from './agrupamientos-8gsrQUb1.js';
import { redirect, fail, error } from '@sveltejs/kit';
import './client-BaYilI3k.js';
import './shared-server-asDUS7ug.js';
import './db-Baevsgh0.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/institucional/agrupamientos/[id]/+page.server.ts
var load = async ({ locals, params }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const id = parseInt(params.id, 10);
	if (isNaN(id)) error(400, "ID inválido");
	const sesion = await obtenerSesion(id);
	if (!sesion) error(404, "Sesión no encontrada");
	return {
		sesion,
		roster: await listarAlumnosDeCurso(sesion.cursoMoodleId).then((us) => us.map((u) => ({
			id: u.id,
			nombre: u.fullname
		}))).catch(() => []),
		votos: await listarVotos(id)
	};
};
function parseCalificaciones(raw) {
	try {
		const arr = JSON.parse(raw);
		if (!Array.isArray(arr)) return [];
		return arr.map((c) => ({
			id: Number(c.id),
			nombre: String(c.nombre ?? ""),
			puntaje: Number(c.puntaje)
		})).filter((c) => c.id > 0 && c.puntaje >= 1 && c.puntaje <= 5);
	} catch {
		return [];
	}
}
var actions = {
	guardarVoto: async ({ request, locals, params }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		const id = parseInt(params.id, 10);
		const fd = await request.formData();
		const votanteMoodleId = parseInt(fd.get("votanteMoodleId")?.toString() ?? "0", 10);
		const votanteNombre = fd.get("votanteNombre")?.trim();
		if (!votanteMoodleId || !votanteNombre) return fail(400, { error: "Alumno votante inválido." });
		const calificaciones = parseCalificaciones(fd.get("calificaciones")?.toString() ?? "[]");
		if (calificaciones.length === 0) return fail(400, { error: "Asigná al menos una calificación a un compañero." });
		const bloqRaw = fd.get("bloqueadoMoodleId")?.toString();
		const bloqueadoMoodleId = bloqRaw ? parseInt(bloqRaw, 10) : null;
		const bloqueadoNombre = fd.get("bloqueadoNombre")?.trim() || null;
		try {
			await guardarVoto(id, {
				votanteMoodleId,
				votanteNombre,
				calificaciones,
				bloqueadoMoodleId: bloqueadoMoodleId && bloqueadoMoodleId > 0 ? bloqueadoMoodleId : null,
				bloqueadoNombre: bloqueadoMoodleId && bloqueadoMoodleId > 0 ? bloqueadoNombre : null
			});
		} catch (err) {
			return fail(500, { error: err instanceof Error ? err.message : "Error al guardar el voto." });
		}
		return { ok: true };
	},
	eliminarVoto: async ({ request, locals }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		const fd = await request.formData();
		const votoId = parseInt(fd.get("votoId")?.toString() ?? "0", 10);
		if (!votoId) return fail(400, { error: "Voto inválido." });
		await eliminarVoto(votoId);
		return { ok: true };
	},
	editarSesion: async ({ request, locals, params }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		const id = parseInt(params.id, 10);
		const fd = await request.formData();
		const titulo = fd.get("titulo")?.trim();
		const fecha = fd.get("fecha")?.trim();
		const notas = fd.get("notas")?.trim() || null;
		if (!titulo || !fecha) return fail(400, { error: "Completá el título y la fecha." });
		await editarSesion(id, {
			titulo,
			fecha,
			notas
		});
		return { ok: true };
	},
	cambiarEstado: async ({ request, locals, params }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		await editarSesion(parseInt(params.id, 10), { estado: (await request.formData()).get("estado")?.toString() === "cerrada" ? "cerrada" : "abierta" });
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
const component = async () => component_cache ??= (await import('./_page.svelte-Dda8cqZ7.js')).default;
const server_id = "src/routes/institucional/agrupamientos/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/14.Cnr1AT7_.js","_app/immutable/chunks/DgMr71MY.js","_app/immutable/chunks/BOwl7bUD.js","_app/immutable/chunks/Bc7-PE6I.js","_app/immutable/chunks/CympIfac.js","_app/immutable/chunks/Dr15X4ZF.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=14-Bam7MIox.js.map
