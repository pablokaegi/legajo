import { p as puedeVerCurso } from './authz-B6Un7KRR.js';
import { t as toMoodleErrorMessage } from './client-B-Jh6LXU.js';
import { a as listarAlumnosDeCurso } from './cursos-KiCjooEC.js';
import { redirect, error } from '@sveltejs/kit';
import './db-XKMgjins.js';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
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

const index = 7;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Cl7rak4p.js')).default;
const server_id = "src/routes/cursos/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/7.C8NsPpXJ.js","_app/immutable/chunks/BCmZRGrY.js","_app/immutable/chunks/CDtWeeEO.js","_app/immutable/chunks/CJsb_cWB.js","_app/immutable/chunks/2TU3FloQ.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=7-CEelrbas.js.map
