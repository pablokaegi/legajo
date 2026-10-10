import { a as listarCursos } from './cursos2-BTSWVjNq.js';
import { n as crearSesion } from './agrupamientos-DwaMuOx0.js';
import { e as exigirStaff } from './acceso-CC5WrM6x.js';
import { fail, redirect } from '@sveltejs/kit';
import './client-CURRDhAR.js';
import './shared-server-asDUS7ug.js';
import './db-DnDhVbjt.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './authz-C2Zplj7X.js';
import 'node:crypto';

//#region src/routes/agrupamientos/nueva/+page.server.ts
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
const component = async () => component_cache ??= (await import('./_page.svelte-BDZjb97w.js')).default;
const server_id = "src/routes/agrupamientos/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/15.CaoS8Ine.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/BI88GkAg.js","_app/immutable/chunks/BpBdz8fz.js","_app/immutable/chunks/BrKMbrgq.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=15-CZQvwnJw.js.map
