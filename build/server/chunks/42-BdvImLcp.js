import { o as esPreceptorODirectivo } from './authz-BOxGka1D.js';
import { a as crearAutorizacionesDeSalida, e as editarSalida, b as obtenerSalida, d as listarAutorizacionesDeSalida } from './salidas-BDNlUAuD.js';
import { redirect, error, fail } from '@sveltejs/kit';
import './db-DeyHlLbL.js';
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

const index = 42;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-xhSKoXPo.js')).default;
const server_id = "src/routes/institucional/salidas/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/42.C6-P2D3v.js","_app/immutable/chunks/BUJoxPBc.js","_app/immutable/chunks/DZfptzON.js","_app/immutable/chunks/Bj-BB-E5.js","_app/immutable/chunks/DXOupJ5Z.js","_app/immutable/chunks/C8H49NTu.js","_app/immutable/chunks/DuRwxM2R.js"];
const stylesheets = ["_app/immutable/assets/42.D_DYosIW.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=42-BdvImLcp.js.map
