import { b as listarAlumnosDeCurso } from './cursos2-BV1UQDP7.js';
import { w as obtenerSesionPorToken, s as procesarVotoDesdeForm, t as idsQueVotaron, u as asignarCompaneros } from './agrupamientos-BFNT9uir.js';
import { fail, error } from '@sveltejs/kit';
import './client-CZ7i8Obi.js';
import './shared-server-asDUS7ug.js';
import './db-BwwlYHWL.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
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
		sesion,
		roster,
		yaVotaron,
		asignaciones
	};
};
var actions = { default: async ({ request, params }) => {
	const sesion = await obtenerSesionPorToken(params.token);
	if (!sesion) return fail(404, { error: "Enlace inválido." });
	if (sesion.estado === "cerrada") return fail(400, { error: "La votación está cerrada." });
	const res = await procesarVotoDesdeForm(sesion.id, await request.formData());
	if ("error" in res) return fail(400, res);
	return { ok: true };
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 37;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CHWTqW4Q.js')).default;
const server_id = "src/routes/votar/[token]/+page.server.ts";
const imports = ["_app/immutable/nodes/37.431YhoH9.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/BEDIq91W.js","_app/immutable/chunks/bt7sISu_.js","_app/immutable/chunks/DuCIje9Q.js","_app/immutable/chunks/8j8Ckqxp.js","_app/immutable/chunks/CdACnDVz.js","_app/immutable/chunks/Dupel53z.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=37-BRhvNiYR.js.map
