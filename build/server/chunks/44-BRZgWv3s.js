import { b as listarAlumnosDeCurso } from './cursos2-CO8sxrLe.js';
import { N as obtenerSesionPorToken, J as procesarVotoDesdeForm, f as modoDe, K as idsQueVotaron, L as asignarCompaneros } from './agrupamientos-Bz0E4k6X.js';
import { fail, error } from '@sveltejs/kit';
import './client-Bg6wabNy.js';
import './shared-server-asDUS7ug.js';
import './db-CnhT25Eo.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './authz-C29w6V7D.js';
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

const index = 44;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BtfcbtZJ.js')).default;
const server_id = "src/routes/votar/[token]/+page.server.ts";
const imports = ["_app/immutable/nodes/44.tvSOZIgT.js","_app/immutable/chunks/BYJUstCy.js","_app/immutable/chunks/BD-4OuCl.js","_app/immutable/chunks/CaexScnI.js","_app/immutable/chunks/L0rYaQvg.js","_app/immutable/chunks/W2mP2Oat.js","_app/immutable/chunks/CqiROUDz.js","_app/immutable/chunks/Dl4rq4th.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=44-BRZgWv3s.js.map
