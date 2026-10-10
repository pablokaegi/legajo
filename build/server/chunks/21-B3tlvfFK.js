import { k as puedeVerCurso } from './authz-C29w6V7D.js';
import { t as toMoodleErrorMessage } from './client-Bg6wabNy.js';
import { b as listarAlumnosDeCurso } from './cursos2-CO8sxrLe.js';
import { redirect, error } from '@sveltejs/kit';
import './db-CnhT25Eo.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/cursos/[id]/+page.server.ts
var load = async ({ params, locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const cursoId = parseInt(params.id, 10);
	if (isNaN(cursoId)) error(400, "ID de curso invalido");
	if (!await puedeVerCurso(locals.usuario.usuarioId)) error(403, "No tenes permiso para ver este curso");
	const cursoNombre = url.searchParams.get("nombre") ?? `Curso ${cursoId}`;
	try {
		return {
			alumnos: await listarAlumnosDeCurso(cursoId),
			cursoId,
			cursoNombre,
			error: null
		};
	} catch (err) {
		return {
			alumnos: [],
			cursoId,
			cursoNombre,
			error: toMoodleErrorMessage(err)
		};
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 21;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BGheIW_G.js')).default;
const server_id = "src/routes/cursos/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/21.CrbdiV5F.js","_app/immutable/chunks/BYJUstCy.js","_app/immutable/chunks/-rrDzI3h.js","_app/immutable/chunks/W2mP2Oat.js","_app/immutable/chunks/BD-4OuCl.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=21-B3tlvfFK.js.map
