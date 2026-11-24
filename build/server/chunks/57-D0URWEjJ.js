import { o as obtenerLegajoAlumno } from './legajo-COo_CXYf.js';
import { M as obtenerHistorialAgrupamientosDeAlumno } from './agrupamientos-Dx_h0nb5.js';
import { a as esDirectivoOAdmin } from './authz-DQJuia-E.js';
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

// src/routes/preceptor/legajo/[alumnoId]/+page.server.ts
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

const index = 57;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-sDvShuDR.js')).default;
const server_id = "src/routes/preceptor/legajo/[alumnoId]/+page.server.ts";
const imports = ["_app/immutable/nodes/57.DEKV-rqH.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=57-D0URWEjJ.js.map
