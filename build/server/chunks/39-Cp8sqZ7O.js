import { e as eliminarEfemeride, a as editarEfemeride, o as obtenerEfemeride } from './efemerides-BvU8YFfu.js';
import { o as esPreceptorODirectivo } from './authz-DQJuia-E.js';
import { redirect, error, fail } from '@sveltejs/kit';
import './db-D7hI4G6x.js';
import './index.js-D6_LEqEo.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

// src/routes/institucional/efemerides/[id]/+page.server.ts
var load = async ({ locals, params }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const id = parseInt(params.id, 10);
	if (isNaN(id)) error(400, "ID inválido");
	const ev = await obtenerEfemeride(id);
	if (!ev) error(404, "Efeméride no encontrada");
	return { ev };
};
var actions = {
	editar: async ({ request, locals, params }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		if (!await esPreceptorODirectivo(locals.usuario.usuarioId)) error(403, "No tenés permiso para editar efemérides.");
		const id = parseInt(params.id, 10);
		const fd = await request.formData();
		const titulo = fd.get("titulo")?.trim();
		const fecha = fd.get("fecha")?.trim();
		if (!titulo || !fecha) return fail(400, { error: "Título y fecha requeridos" });
		const cursosArr = (fd.get("cursosResponsables")?.trim() ?? "").split("\n").map((s) => s.trim()).filter(Boolean).map((s) => ({ cursoNombre: s }));
		const cursosJson = cursosArr.length > 0 ? JSON.stringify(cursosArr) : null;
		await editarEfemeride(id, {
			titulo,
			fecha,
			descripcion: fd.get("descripcion")?.trim() || null,
			cursosResponsables: cursosJson,
			docenteResponsable: fd.get("docenteResponsable")?.trim() || null,
			estado: fd.get("estado") || "planificado",
			notas: fd.get("notas")?.trim() || null
		});
		throw redirect(303, `/institucional/efemerides/${id}`);
	},
	eliminar: async ({ locals, params }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		if (!await esPreceptorODirectivo(locals.usuario.usuarioId)) error(403, "No tenés permiso para eliminar efemérides.");
		const id = parseInt(params.id, 10);
		await eliminarEfemeride(id);
		throw redirect(303, "/institucional/efemerides");
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 39;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-D4Gt2wyc.js')).default;
const server_id = "src/routes/institucional/efemerides/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/39.D2mrtQCV.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=39-Cp8sqZ7O.js.map
