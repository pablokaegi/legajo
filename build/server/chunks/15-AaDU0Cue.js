import { a as listarCursos } from './cursos2-BuIc_Cww.js';
import { n as crearSesion } from './agrupamientos-Dx_h0nb5.js';
import { e as exigirStaff } from './acceso2-XBo-WmRi.js';
import { fail, redirect } from '@sveltejs/kit';
import './client-txz_W3Xb.js';
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
import './authz-DQJuia-E.js';
import 'node:crypto';

// src/routes/agrupamientos/nueva/+page.server.ts
var load = async ({ locals }) => {
	await exigirStaff(locals.usuario);
	return { cursos: await listarCursos().catch(() => []) };
};
var actions = { default: async ({ request, locals }) => {
	const usuarioId = await exigirStaff(locals.usuario);
	const fd = await request.formData();
	const cursoMoodleId = parseInt(fd.get("cursoMoodleId")?.toString() ?? "0", 10);
	const cursoNombre = fd.get("cursoNombre")?.trim();
	const titulo = fd.get("titulo")?.trim();
	const fecha = fd.get("fecha")?.trim();
	const notas = fd.get("notas")?.trim() || void 0;
	const cantRaw = parseInt(fd.get("cantidadEvaluar")?.toString() ?? "3", 10);
	const cantidadEvaluar = isNaN(cantRaw) ? 3 : Math.max(1, Math.min(5, cantRaw));
	const permiteBloqueo = fd.get("permiteBloqueo") === "1";
	if (!cursoMoodleId || !cursoNombre) return fail(400, { error: "Seleccioná un curso." });
	if (!titulo || !fecha) return fail(400, { error: "Completá el título y la fecha." });
	let id;
	try {
		id = await crearSesion(usuarioId, {
			cursoMoodleId,
			cursoNombre,
			titulo,
			fecha,
			cantidadEvaluar,
			permiteBloqueo,
			notas
		});
	} catch (err) {
		return fail(500, { error: err instanceof Error ? err.message : "Error al guardar" });
	}
	throw redirect(303, `/agrupamientos/${id}`);
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 15;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BjeWHk8q.js')).default;
const server_id = "src/routes/agrupamientos/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/15.BBydRsYZ.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js","_app/immutable/chunks/Bzau-lkd.js","_app/immutable/chunks/DeF1vw6K.js","_app/immutable/chunks/C0D3a8lr.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=15-AaDU0Cue.js.map
