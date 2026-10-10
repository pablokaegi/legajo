import { o as esPreceptorODirectivo } from './authz-C2Zplj7X.js';
import { a as crearAutorizacionesDeSalida, e as editarSalida, b as obtenerSalida, d as listarAutorizacionesDeSalida } from './salidas-DCmRe8Wp.js';
import { redirect, error, fail } from '@sveltejs/kit';
import './db-DnDhVbjt.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'node:crypto';

//#region src/routes/institucional/salidas/[id]/+page.server.ts
var load = async ({ locals, params, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const id = parseInt(params.id, 10);
	if (isNaN(id)) error(400, "ID inválido");
	const salida = await obtenerSalida(id);
	if (!salida) error(404, "Salida no encontrada");
	return {
		salida,
		autorizaciones: await listarAutorizacionesDeSalida(id),
		imprimir: url.searchParams.has("imprimir")
	};
};
var actions = {
	editar: async ({ request, locals, params }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		if (!await esPreceptorODirectivo(locals.usuario.usuarioId)) error(403, "No tenés permiso para editar salidas.");
		const id = parseInt(params.id, 10);
		const fd = await request.formData();
		const titulo = fd.get("titulo")?.trim();
		const fecha = fd.get("fecha")?.trim();
		const destino = fd.get("destino")?.trim();
		const responsableNombre = fd.get("responsableNombre")?.trim();
		const cursoNombre = fd.get("cursoNombre")?.trim();
		if (!titulo || !fecha || !destino || !responsableNombre || !cursoNombre) return fail(400, { error: "Completá todos los campos obligatorios" });
		const cantRaw = parseInt(fd.get("cantidadAlumnos"), 10);
		await editarSalida(id, {
			titulo,
			fecha,
			destino,
			responsableNombre,
			cursoNombre,
			descripcion: fd.get("descripcion")?.trim() || null,
			cantidadAlumnos: isNaN(cantRaw) ? null : cantRaw,
			costoEstimado: fd.get("costoEstimado")?.trim() || null,
			estado: fd.get("estado") || "borrador",
			notas: fd.get("notas")?.trim() || null
		});
		throw redirect(303, `/institucional/salidas/${id}`);
	},
	agregarAlumnos: async ({ request, locals, params }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		if (!await esPreceptorODirectivo(locals.usuario.usuarioId)) error(403, "No tenés permiso para modificar salidas.");
		const id = parseInt(params.id, 10);
		const fd = await request.formData();
		let alumnos = [];
		try {
			const raw = String(fd.get("alumnos") ?? "[]");
			const parsed = JSON.parse(raw);
			if (!Array.isArray(parsed)) return fail(400, { errorAlumnos: "Datos inválidos" });
			alumnos = parsed.map((a) => ({
				alumnoMoodleId: Number(a.alumnoMoodleId),
				alumnoNombre: String(a.alumnoNombre ?? "")
			})).filter((a) => a.alumnoMoodleId > 0 && a.alumnoNombre.length > 0);
		} catch {
			return fail(400, { errorAlumnos: "Datos inválidos" });
		}
		if (alumnos.length === 0) return fail(400, { errorAlumnos: "Seleccioná al menos un alumno" });
		await crearAutorizacionesDeSalida(id, alumnos);
		throw redirect(303, `/institucional/salidas/${id}`);
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 39;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DbfQyIn7.js')).default;
const server_id = "src/routes/institucional/salidas/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/39.CrQQgnf7.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/BI88GkAg.js","_app/immutable/chunks/BpBdz8fz.js","_app/immutable/chunks/BrKMbrgq.js","_app/immutable/chunks/CB-M-fzd.js","_app/immutable/chunks/Cxo5QU0_.js"];
const stylesheets = ["_app/immutable/assets/39.D_DYosIW.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=39-7aSIpYwv.js.map
