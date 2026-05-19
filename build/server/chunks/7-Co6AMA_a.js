import { p as puedeVerCurso } from './authz-GJL0_cK3.js';
import { t as toMoodleErrorMessage } from './client-C5rBgvQ9.js';
import { a as listarAlumnosDeCurso } from './cursos-DB2yJeVE.js';
import { redirect, error } from '@sveltejs/kit';
import './db-CcRogbU_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/cursos/[id]/+page.server.ts
var load = async ({ params, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const cursoId = parseInt(params.id, 10);
	if (isNaN(cursoId)) error(400, "ID de curso invalido");
	if (!await puedeVerCurso(locals.usuario.usuarioId)) error(403, "No tenes permiso para ver este curso");
	try {
		return {
			alumnos: await listarAlumnosDeCurso(cursoId),
			cursoId,
			error: null
		};
	} catch (err) {
		return {
			alumnos: [],
			cursoId,
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
const component = async () => component_cache ??= (await import('./_page.svelte-kIm7izOE.js')).default;
const server_id = "src/routes/cursos/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/7.CAXM8WDr.js","_app/immutable/chunks/DfszB34S.js","_app/immutable/chunks/f-8uk_KC.js","_app/immutable/chunks/3HcCikZU.js","_app/immutable/chunks/CuyqONxg.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=7-Co6AMA_a.js.map
