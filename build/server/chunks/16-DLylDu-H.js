import { b as listarAlumnosDeCurso } from './cursos2-BatpgMc1.js';
import { u as procesarVotoDesdeForm, v as idsQueVotaron, w as asignarCompaneros } from './agrupamientos-CzVZ4XZy.js';
import { a as exigirSesion } from './acceso-CA9aGo2G.js';
import { fail } from '@sveltejs/kit';
import './client-B7Rm4XeY.js';
import './shared-server-asDUS7ug.js';
import './db-DLV0Mytb.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './authz-52jG9anb.js';
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
	const yaVotaron = [...await idsQueVotaron(sesion.id)];
	const asignaciones = {};
	for (const a of roster) asignaciones[a.id] = asignarCompaneros(sesion.id, a.id, roster, sesion.cantidadEvaluar);
	return {
		sesion,
		roster,
		yaVotaron,
		asignaciones
	};
};
var actions = { votar: async ({ request, locals, params }) => {
	const { sesion } = await exigirSesion(locals.usuario, params.id, "gestionar");
	if (sesion.estado === "cerrada") return fail(400, { error: "La votación está cerrada." });
	const roster = await rosterDe(sesion.cursoMoodleId);
	if (roster.length === 0) return fail(503, { error: "No se pudo obtener la lista del curso." });
	const res = await procesarVotoDesdeForm(sesion.id, await request.formData(), {
		roster,
		cantidadEvaluar: sesion.cantidadEvaluar
	});
	if ("error" in res) return fail(400, res);
	return { ok: true };
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 16;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DZ6BvICF.js')).default;
const server_id = "src/routes/agrupamientos/[id]/votar/+page.server.ts";
const imports = ["_app/immutable/nodes/16.BtuRYUy-.js","_app/immutable/chunks/DegnJ6pp.js","_app/immutable/chunks/DYR6MKK2.js","_app/immutable/chunks/CyWGaPcn.js","_app/immutable/chunks/BWK06xDr.js","_app/immutable/chunks/CdpVQA3m.js","_app/immutable/chunks/BRtrDO_y.js","_app/immutable/chunks/C8-c7kPr.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=16-DLylDu-H.js.map
