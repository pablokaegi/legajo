import { p as puedeVerCurso } from './authz-BKiCLRVr.js';
import { t as toMoodleErrorMessage } from './client-Cg7YvpsO.js';
import { a as listarAlumnosDeCurso } from './cursos-CCgXIkSH.js';
import { redirect, error } from '@sveltejs/kit';
import './db-D9cZesji.js';
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

const index = 6;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DuSBFcI7.js')).default;
const server_id = "src/routes/cursos/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/6.DKHBLW6x.js","_app/immutable/chunks/g7562_RU.js","_app/immutable/chunks/CXp9_IYi.js","_app/immutable/chunks/DWsRlVmj.js","_app/immutable/chunks/CsaauQz1.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=6-Cqn7Fnyd.js.map
