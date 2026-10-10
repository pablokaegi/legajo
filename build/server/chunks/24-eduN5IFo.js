import { k as puedeVerCurso } from './authz-C2Zplj7X.js';
import { t as toMoodleErrorMessage } from './client-CURRDhAR.js';
import { b as listarAlumnosDeCurso } from './cursos2-BTSWVjNq.js';
import { redirect, error } from '@sveltejs/kit';
import './db-DnDhVbjt.js';
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

const index = 24;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Broamixj.js')).default;
const server_id = "src/routes/cursos/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/24.B4ohRgNX.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/jdNgL1WM.js","_app/immutable/chunks/BpBdz8fz.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=24-eduN5IFo.js.map
