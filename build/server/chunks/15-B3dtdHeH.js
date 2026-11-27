import { p as puedeVerCurso, n as cursosVisiblesPara } from './authz-BVdVv-6k.js';
import { a as listarCursos } from './cursos2-pDrqIz-A.js';
import { n as crearSesion } from './agrupamientos-f9JamgYJ.js';
import { e as exigirStaff } from './acceso2-CDk--U70.js';
import { fail, redirect } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './client-Dsrb4zGp.js';
import './rest-qugARKMk.js';
import 'node:crypto';

//#region src/routes/agrupamientos/nueva/+page.server.ts
var load = async ({ locals }) => {
	return { cursos: await cursosVisiblesPara(await exigirStaff(locals.usuario), await listarCursos().catch(() => [])) };
};
var actions = { default: async ({ request, locals }) => {
	const usuarioId = await exigirStaff(locals.usuario);
	const fd = await request.formData();
	const cursoMoodleId = Number(fd.get("cursoMoodleId"));
	const titulo = fd.get("titulo")?.trim();
	const fecha = fd.get("fecha")?.trim();
	const notas = fd.get("notas")?.trim() || void 0;
	const cantRaw = parseInt(fd.get("cantidadEvaluar")?.toString() ?? "3", 10);
	const cantidadEvaluar = isNaN(cantRaw) ? 3 : Math.max(1, Math.min(5, cantRaw));
	const permiteBloqueo = fd.get("permiteBloqueo") === "1";
	if (!Number.isSafeInteger(cursoMoodleId) || cursoMoodleId <= 0) return fail(400, { error: "Seleccioná un curso." });
	if (!titulo || !fecha) return fail(400, { error: "Completá el título y la fecha." });
	if (!await puedeVerCurso(usuarioId, cursoMoodleId)) return fail(403, { error: "No tenés acceso a este curso." });
	const cursos = await listarCursos().catch(() => null);
	if (cursos === null) return fail(503, { error: "No se pudo consultar los cursos en Moodle." });
	const curso = cursos.find((c) => c.id === cursoMoodleId);
	if (!curso) return fail(400, { error: "El curso no está disponible en Moodle." });
	const cursoNombre = (curso.displayname || curso.fullname).slice(0, 200);
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
const component = async () => component_cache ??= (await import('./_page.svelte-Dfq6ymeF.js')).default;
const server_id = "src/routes/agrupamientos/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/15.Zt4EU4b0.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/B8RcQQp0.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/M6KOCQrT.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=15-B3dtdHeH.js.map
