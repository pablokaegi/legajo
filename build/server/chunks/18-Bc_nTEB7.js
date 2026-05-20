import { b as esDirectivo } from './authz-CJZdTBdJ.js';
import { o as obtenerHistorialFiltrado } from './observaciones-CBVocrsk.js';
import { redirect } from '@sveltejs/kit';
import './db-Dxq-FYMn.js';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
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
	const omitUsuarioFilter = await esDirectivo(locals.usuario.usuarioId);
	const { observaciones, total } = await obtenerHistorialFiltrado({
		usuarioId: locals.usuario.usuarioId,
		alumno,
		curso,
		limit: PAGE_SIZE,
		offset: (page - 1) * PAGE_SIZE,
		omitUsuarioFilter
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

const index = 18;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B8yUK-f_.js')).default;
const server_id = "src/routes/observaciones/historial/+page.server.ts";
const imports = ["_app/immutable/nodes/18.prz_4CQJ.js","_app/immutable/chunks/uSN3y40e.js","_app/immutable/chunks/BQbsh3DA.js","_app/immutable/chunks/Bm6dNch2.js","_app/immutable/chunks/B8WnZMYa.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=18-Bc_nTEB7.js.map
