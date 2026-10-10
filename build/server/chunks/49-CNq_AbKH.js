import { o as obtenerActaCompleta, u as usuarioPuedeVerActa } from './actas-BEOW5gjY.js';
import { redirect, error } from '@sveltejs/kit';
import './db-DeyHlLbL.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './authz-BOxGka1D.js';
import 'drizzle-orm';
import 'zod';

//#region src/routes/preceptor/actas/[id]/+page.server.ts
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

const index = 49;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte--I1LU-bI.js')).default;
const server_id = "src/routes/preceptor/actas/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/49.KYxZKCqa.js","_app/immutable/chunks/BUJoxPBc.js","_app/immutable/chunks/C8H49NTu.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=49-CNq_AbKH.js.map
