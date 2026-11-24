import { b as obtenerSalida, d as listarAutorizacionesDeSalida } from './salidas-CkIitNEO.js';
import { redirect, error } from '@sveltejs/kit';
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
import 'node:crypto';

// src/routes/institucional/salidas/[id]/archivo/+page.server.ts
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

const index = 43;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CpzmXmrP.js')).default;
const server_id = "src/routes/institucional/salidas/[id]/archivo/+page.server.ts";
const imports = ["_app/immutable/nodes/43.B_POPTMq.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js","_app/immutable/chunks/BED2mB-Q.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=43-Dp03X04T.js.map
