import { b as listarAlumnosDeCurso } from './cursos2-BTSWVjNq.js';
import { N as obtenerSesionPorToken, J as procesarVotoDesdeForm, f as modoDe, K as idsQueVotaron, L as asignarCompaneros } from './agrupamientos-DwaMuOx0.js';
import { fail, error } from '@sveltejs/kit';
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

//#region src/routes/votar/[token]/+page.server.ts
async function rosterDe(cursoMoodleId) {
	return (await listarAlumnosDeCurso(cursoMoodleId).catch(() => [])).map((u) => ({
		id: u.id,
		nombre: u.fullname
	}));
}
var load = async ({ params }) => {
	const sesion = await obtenerSesionPorToken(params.token);
	if (!sesion) error(404, "El enlace de votación no es válido o ya no está disponible.");
	const roster = await rosterDe(sesion.cursoMoodleId);
	const modo = modoDe(sesion);
	const yaVotaron = [...await idsQueVotaron(sesion.id)];
	const asignaciones = {};
	if (modo === "calificacion") for (const a of roster) asignaciones[a.id] = asignarCompaneros(sesion.id, a.id, roster, sesion.cantidadEvaluar);
	return {
		sesion: {
			titulo: sesion.titulo,
			cursoNombre: sesion.cursoNombre,
			estado: sesion.estado,
			cantidadEvaluar: sesion.cantidadEvaluar,
			permiteBloqueo: sesion.permiteBloqueo
		},
		roster,
		yaVotaron,
		asignaciones,
		modo
	};
};
var actions = { default: async ({ request, params }) => {
	const sesion = await obtenerSesionPorToken(params.token);
	if (!sesion) return fail(404, { error: "Enlace inválido." });
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

const index = 54;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-sZ_5-LVF.js')).default;
const server_id = "src/routes/votar/[token]/+page.server.ts";
const imports = ["_app/immutable/nodes/54.mTj-w0so.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/CB-M-fzd.js","_app/immutable/chunks/BiBTFfag.js","_app/immutable/chunks/BI88GkAg.js","_app/immutable/chunks/BpBdz8fz.js","_app/immutable/chunks/BrKMbrgq.js","_app/immutable/chunks/Cxo5QU0_.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=54-C4-D7tCC.js.map
