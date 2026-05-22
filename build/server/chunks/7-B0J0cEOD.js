import { a as listarCursos } from './cursos2-mJdtD_zg.js';
import { c as crearSesion } from './agrupamientos-lx1fDlSI.js';
import { redirect, fail } from '@sveltejs/kit';
import './client-BJtlkHyJ.js';
import './shared-server-asDUS7ug.js';
import './db-DpfkJINj.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'node:crypto';

//#region src/routes/agrupamientos/nueva/+page.server.ts
var load = async ({ locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	return { cursos: await listarCursos().catch(() => []) };
};
var actions = { default: async ({ request, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const fd = await request.formData();
	const cursoMoodleId = parseInt(fd.get("cursoMoodleId")?.toString() ?? "0", 10);
	const cursoNombre = fd.get("cursoNombre")?.trim();
	const titulo = fd.get("titulo")?.trim();
	const fecha = fd.get("fecha")?.trim();
	const notas = fd.get("notas")?.trim() || void 0;
	if (!cursoMoodleId || !cursoNombre) return fail(400, { error: "Seleccioná un curso." });
	if (!titulo || !fecha) return fail(400, { error: "Completá el título y la fecha." });
	let id;
	try {
		id = await crearSesion(locals.usuario.usuarioId, {
			cursoMoodleId,
			cursoNombre,
			titulo,
			fecha,
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

const index = 7;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CwPnaBiD.js')).default;
const server_id = "src/routes/agrupamientos/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/7.cAaZhHwA.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/CAO25VOS.js","_app/immutable/chunks/CTSaFKi3.js","_app/immutable/chunks/BwXCMlno.js","_app/immutable/chunks/BEDIq91W.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=7-B0J0cEOD.js.map
