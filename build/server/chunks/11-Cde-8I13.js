import { b as listarAlumnosDeCurso } from './cursos2-mJdtD_zg.js';
import { o as obtenerSesion, s as procesarVotoDesdeForm, t as idsQueVotaron, u as asignarCompaneros } from './agrupamientos-lx1fDlSI.js';
import { redirect, fail, error } from '@sveltejs/kit';
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

//#region src/routes/agrupamientos/[id]/votar/+page.server.ts
var load = async ({ locals, params }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const id = parseInt(params.id, 10);
	if (isNaN(id)) error(400, "ID inválido");
	const sesion = await obtenerSesion(id);
	if (!sesion) error(404, "Sesión no encontrada");
	const roster = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => [])).map((u) => ({
		id: u.id,
		nombre: u.fullname
	}));
	const yaVotaron = [...await idsQueVotaron(id)];
	const asignaciones = {};
	for (const a of roster) asignaciones[a.id] = asignarCompaneros(id, a.id, roster, sesion.cantidadEvaluar);
	return {
		sesion,
		roster,
		yaVotaron,
		asignaciones
	};
};
var actions = { votar: async ({ request, locals, params }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const id = parseInt(params.id, 10);
	const sesion = await obtenerSesion(id);
	if (!sesion) return fail(404, { error: "Sesión no encontrada." });
	if (sesion.estado === "cerrada") return fail(400, { error: "La votación está cerrada." });
	const res = await procesarVotoDesdeForm(id, await request.formData());
	if ("error" in res) return fail(400, res);
	return { ok: true };
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 11;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-jcSHbrC4.js')).default;
const server_id = "src/routes/agrupamientos/[id]/votar/+page.server.ts";
const imports = ["_app/immutable/nodes/11.B03KFWoi.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/BEDIq91W.js","_app/immutable/chunks/Jix5uwpK.js","_app/immutable/chunks/CAO25VOS.js","_app/immutable/chunks/CTSaFKi3.js","_app/immutable/chunks/BwXCMlno.js","_app/immutable/chunks/Dupel53z.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=11-Cde-8I13.js.map
