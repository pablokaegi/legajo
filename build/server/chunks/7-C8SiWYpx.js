import { p as puedeVerCurso } from './authz-qx5pRuic.js';
import { t as toMoodleErrorMessage } from './client-B0ypzjEJ.js';
import { a as listarAlumnosDeCurso } from './cursos-3BoVQuWF.js';
import { redirect, error } from '@sveltejs/kit';
import './db-C42nfPYx.js';
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
const component = async () => component_cache ??= (await import('./_page.svelte-BpRlUSYe.js')).default;
const server_id = "src/routes/cursos/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/7.CEavDb4K.js","_app/immutable/chunks/DnZ0s7ag.js","_app/immutable/chunks/BXbdQEhD.js","_app/immutable/chunks/DsZAl9AC.js","_app/immutable/chunks/CuyqONxg.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=7-C8SiWYpx.js.map
