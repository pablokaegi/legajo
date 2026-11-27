import { b as listarAlumnosDeCurso } from './cursos2-pDrqIz-A.js';
import { J as procesarVotoDesdeForm, f as modoDe, K as idsQueVotaron, L as asignarCompaneros } from './agrupamientos-f9JamgYJ.js';
import { a as exigirSesion } from './acceso2-CDk--U70.js';
import { fail } from '@sveltejs/kit';
import './client-Dsrb4zGp.js';
import './shared-server-asDUS7ug.js';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './rest-qugARKMk.js';
import 'drizzle-orm';
import './authz-BVdVv-6k.js';
import 'node:crypto';

//#region src/routes/agrupamientos/[id]/votar/+page.server.ts
async function rosterDe(cursoMoodleId) {
	return (await listarAlumnosDeCurso(cursoMoodleId).catch(() => [])).map((u) => ({
		id: u.id,
		nombre: u.fullname
	}));
}
var load = async ({ locals, params }) => {
	const { sesion } = await exigirSesion(locals.usuario, params.id, "gestionar");
	const roster = await rosterDe(sesion.cursoMoodleId);
	const modo = modoDe(sesion);
	const yaVotaron = [...await idsQueVotaron(sesion.id)];
	const asignaciones = {};
	if (modo === "calificacion") for (const a of roster) asignaciones[a.id] = asignarCompaneros(sesion.id, a.id, roster, sesion.cantidadEvaluar);
	return {
		sesion,
		roster,
		yaVotaron,
		asignaciones,
		modo
	};
};
var actions = { votar: async ({ request, locals, params }) => {
	const { sesion } = await exigirSesion(locals.usuario, params.id, "gestionar");
	if (sesion.estado === "cerrada") return fail(400, { error: "La votación está cerrada." });
	const roster = await rosterDe(sesion.cursoMoodleId);
	if (roster.length === 0) return fail(503, { error: "No se pudo obtener la lista del curso." });
	const res = await procesarVotoDesdeForm(sesion.id, await request.formData(), {
		roster,
		cantidadEvaluar: sesion.cantidadEvaluar,
		modo: modoDe(sesion),
		permiteBloqueo: sesion.permiteBloqueo
	});
	if ("error" in res) return fail(400, res);
	return { ok: true };
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 19;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DH2QIXtP.js')).default;
const server_id = "src/routes/agrupamientos/[id]/votar/+page.server.ts";
const imports = ["_app/immutable/nodes/19.CbulsryL.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js","_app/immutable/chunks/BZ1iHnJV.js","_app/immutable/chunks/B8RcQQp0.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/M6KOCQrT.js","_app/immutable/chunks/4WnCJOoR.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=19-CdZpUtJ1.js.map
