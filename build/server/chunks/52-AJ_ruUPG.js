import { o as obtenerActaCompleta, u as usuarioPuedeVerActa } from './actas-GmZRa6-X.js';
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
import './authz-DQJuia-E.js';
import 'drizzle-orm';
import 'zod';

// src/routes/preceptor/actas/[id]/+page.server.ts
var load = async ({ locals, params }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const id = parseInt(params.id, 10);
	if (isNaN(id)) error(400, "ID inválido");
	const acta = await obtenerActaCompleta(id);
	if (!acta) error(404, "Acta no encontrada");
	if (!await usuarioPuedeVerActa(locals.usuario.usuarioId, acta)) error(404, "Acta no encontrada");
	return { acta };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 52;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-C1n6YJP5.js')).default;
const server_id = "src/routes/preceptor/actas/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/52.Bz1FgyRC.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=52-AJ_ruUPG.js.map
