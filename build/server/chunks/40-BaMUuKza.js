import { b as obtenerSalida, d as listarAutorizacionesDeSalida } from './salidas-DCmRe8Wp.js';
import { redirect, error } from '@sveltejs/kit';
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

//#region src/routes/institucional/salidas/[id]/archivo/+page.server.ts
var load = async ({ locals, params }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const id = parseInt(params.id, 10);
	if (isNaN(id)) error(400, "ID inválido");
	const salida = await obtenerSalida(id);
	if (!salida) error(404, "Salida no encontrada");
	const todas = await listarAutorizacionesDeSalida(id);
	return {
		salida,
		recibidas: todas.filter((a) => a.documentoPath),
		pendientes: todas.filter((a) => !a.documentoPath)
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 40;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DW3-3aKg.js')).default;
const server_id = "src/routes/institucional/salidas/[id]/archivo/+page.server.ts";
const imports = ["_app/immutable/nodes/40.FysdGSuZ.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/CB-M-fzd.js","_app/immutable/chunks/Cxo5QU0_.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=40-BaMUuKza.js.map
