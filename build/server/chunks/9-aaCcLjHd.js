import { h as puedeVerCurso } from './authz-3kjxFg8F.js';
import { t as toMoodleErrorMessage } from './client-Caj_4xk9.js';
import { a as listarAlumnosDeCurso } from './cursos2-CsA1lmu1.js';
import { redirect, error } from '@sveltejs/kit';
import './db-BwwlYHWL.js';
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

const index = 9;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DWdfwjMn.js')).default;
const server_id = "src/routes/cursos/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/9.DTc3f35d.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/B0YrUWIx.js","_app/immutable/chunks/C399WJGk.js","_app/immutable/chunks/BEDIq91W.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=9-aaCcLjHd.js.map
