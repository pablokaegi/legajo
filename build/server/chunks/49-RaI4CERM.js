import { l as esDirectivo, h as alcanceCursos } from './authz-BVdVv-6k.js';
import { o as obtenerHistorialFiltrado } from './observaciones-B9bJRDH-.js';
import { redirect } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';

//#region src/routes/observaciones/historial/+page.server.ts
var PAGE_SIZE = 20;
var load = async ({ url, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const alumno = url.searchParams.get("alumno")?.trim() || void 0;
	const curso = url.searchParams.get("curso")?.trim() || void 0;
	const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
	const guardado = url.searchParams.get("guardado") === "1";
	const [omitUsuarioFilter, cursosPermitidos] = await Promise.all([esDirectivo(locals.usuario.usuarioId), alcanceCursos(locals.usuario.usuarioId)]);
	const { observaciones, total } = await obtenerHistorialFiltrado({
		usuarioId: locals.usuario.usuarioId,
		alumno,
		curso,
		limit: PAGE_SIZE,
		offset: (page - 1) * PAGE_SIZE,
		omitUsuarioFilter,
		cursosPermitidos
	});
	return {
		observaciones,
		total,
		page,
		totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
		filtros: {
			alumno: alumno ?? "",
			curso: curso ?? ""
		},
		guardado
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 49;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DAkdOm0P.js')).default;
const server_id = "src/routes/observaciones/historial/+page.server.ts";
const imports = ["_app/immutable/nodes/49.B3t_IPlp.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/M6KOCQrT.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=49-RaI4CERM.js.map
