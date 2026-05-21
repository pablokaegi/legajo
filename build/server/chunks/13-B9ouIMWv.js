import { l as listarCursos } from './cursos2-CPrTViO2.js';
import { c as crearSesion } from './agrupamientos-8gsrQUb1.js';
import { redirect, fail } from '@sveltejs/kit';
import './client-BaYilI3k.js';
import './shared-server-asDUS7ug.js';
import './db-Baevsgh0.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/institucional/agrupamientos/nueva/+page.server.ts
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
	throw redirect(303, `/institucional/agrupamientos/${id}`);
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 13;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DRLxjTrV.js')).default;
const server_id = "src/routes/institucional/agrupamientos/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/13.C81sq83I.js","_app/immutable/chunks/DgMr71MY.js","_app/immutable/chunks/BOwl7bUD.js","_app/immutable/chunks/Bc7-PE6I.js","_app/immutable/chunks/CympIfac.js","_app/immutable/chunks/Dr15X4ZF.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=13-B9ouIMWv.js.map
