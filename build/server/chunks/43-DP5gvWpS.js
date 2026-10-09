import { b as listarAlumnosDeCurso } from './cursos2-BatpgMc1.js';
import { y as obtenerSesionPorToken, u as procesarVotoDesdeForm, v as idsQueVotaron, w as asignarCompaneros } from './agrupamientos-CzVZ4XZy.js';
import { fail, error } from '@sveltejs/kit';
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

//#region src/routes/votar/[token]/+page.server.ts
var load = async ({ params }) => {
	const sesion = await obtenerSesionPorToken(params.token);
	if (!sesion) error(404, "El enlace de votación no es válido o ya no está disponible.");
	const roster = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => [])).map((u) => ({
		id: u.id,
		nombre: u.fullname
	}));
	const yaVotaron = [...await idsQueVotaron(sesion.id)];
	const asignaciones = {};
	for (const a of roster) asignaciones[a.id] = asignarCompaneros(sesion.id, a.id, roster, sesion.cantidadEvaluar);
	return {
		sesion: {
			titulo: sesion.titulo,
			cursoNombre: sesion.cursoNombre,
			estado: sesion.estado
		},
		roster,
		yaVotaron,
		asignaciones
	};
};
var actions = { default: async ({ request, params }) => {
	const sesion = await obtenerSesionPorToken(params.token);
	if (!sesion) return fail(404, { error: "Enlace inválido." });
	if (sesion.estado === "cerrada") return fail(400, { error: "La votación está cerrada." });
	const roster = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => [])).map((u) => ({
		id: u.id,
		nombre: u.fullname
	}));
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

const index = 43;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B_mSFZ05.js')).default;
const server_id = "src/routes/votar/[token]/+page.server.ts";
const imports = ["_app/immutable/nodes/43.D4fNJ4xQ.js","_app/immutable/chunks/DegnJ6pp.js","_app/immutable/chunks/DYR6MKK2.js","_app/immutable/chunks/CyWGaPcn.js","_app/immutable/chunks/BWK06xDr.js","_app/immutable/chunks/CdpVQA3m.js","_app/immutable/chunks/BRtrDO_y.js","_app/immutable/chunks/C8-c7kPr.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=43-DP5gvWpS.js.map
