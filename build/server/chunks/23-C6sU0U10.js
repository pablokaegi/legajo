import { a as crearAutorizacionesDeSalida, e as editarSalida, b as obtenerSalida, d as listarAutorizacionesDeSalida } from './salidas-Dy6rwFqG.js';
import { redirect, fail, error } from '@sveltejs/kit';
import './db-BwwlYHWL.js';
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

const index = 23;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-k-6uWAba.js')).default;
const server_id = "src/routes/institucional/salidas/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/23.DLhp8V0y.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/DswziZon.js","_app/immutable/chunks/C399WJGk.js","_app/immutable/chunks/DdUgi1ch.js","_app/immutable/chunks/BEDIq91W.js","_app/immutable/chunks/Dupel53z.js"];
const stylesheets = ["_app/immutable/assets/23.D_DYosIW.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=23-C6sU0U10.js.map
