import { a as esDirectivoOAdmin } from './authz-C2Zplj7X.js';
import { M as obtenerHistorialAgrupamientosDeAlumno } from './agrupamientos-DwaMuOx0.js';
import { o as obtenerLegajoAlumno } from './legajo-BuMlyz2a.js';
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

//#region src/routes/preceptor/legajo/[alumnoId]/+page.server.ts
var load = async ({ locals, params }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const alumnoMoodleId = parseInt(params.alumnoId, 10);
	if (isNaN(alumnoMoodleId) || alumnoMoodleId <= 0) throw error(400, "ID inválido");
	const verTodas = await esDirectivoOAdmin(locals.usuario.usuarioId);
	const [legajo, agrupamientos] = await Promise.all([obtenerLegajoAlumno(alumnoMoodleId, {
		usuarioId: locals.usuario.usuarioId,
		verTodas
	}), obtenerHistorialAgrupamientosDeAlumno(alumnoMoodleId).catch(() => [])]);
	return {
		legajo,
		agrupamientos
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 51;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-pCd0VvpR.js')).default;
const server_id = "src/routes/preceptor/legajo/[alumnoId]/+page.server.ts";
const imports = ["_app/immutable/nodes/51.CG7Gupht.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=51-BMeBROWP.js.map
