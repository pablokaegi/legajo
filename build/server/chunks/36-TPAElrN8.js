import { o as esPreceptorODirectivo } from './authz-C2Zplj7X.js';
import { e as eliminarEfemeride, a as editarEfemeride, o as obtenerEfemeride } from './efemerides-Dw2VGuvQ.js';
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

//#region src/routes/institucional/efemerides/[id]/+page.server.ts
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
		await eliminarEfemeride(parseInt(params.id, 10));
		throw redirect(303, "/institucional/efemerides");
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 36;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-X9Cqe7Kf.js')).default;
const server_id = "src/routes/institucional/efemerides/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/36.y9hpHmU8.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=36-TPAElrN8.js.map
