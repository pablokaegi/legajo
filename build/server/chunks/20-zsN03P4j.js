import { i as puedeVerAlumno } from './authz-C3UU1LOA.js';
import { m as moodle, t as toMoodleErrorMessage } from './client-DB9NWpTW.js';
import { redirect, error } from '@sveltejs/kit';
import './db-BwfbdrtT.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/cursos/[id]/alumnos/[alumnoId]/notas/+page.server.ts
var load = async ({ params, url, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const courseId = parseInt(params.id, 10);
	const userId = parseInt(params.alumnoId, 10);
	if (isNaN(courseId) || isNaN(userId)) error(400, "IDs invalidos");
	if (!await puedeVerAlumno(locals.usuario.usuarioId, userId)) error(403, "No tenes permiso para ver este alumno");
	const alumnoNombre = url.searchParams.get("nombre") ?? "Alumno";
	const cursoNombre = url.searchParams.get("curso") ?? "";
	try {
		return {
			grades: await moodle.getGradeItems(courseId, userId),
			courseId,
			userId,
			alumnoNombre,
			cursoNombre,
			error: null
		};
	} catch (err) {
		return {
			grades: null,
			courseId,
			userId,
			alumnoNombre,
			cursoNombre,
			error: toMoodleErrorMessage(err)
		};
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 20;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DzCrKMHp.js')).default;
const server_id = "src/routes/cursos/[id]/alumnos/[alumnoId]/notas/+page.server.ts";
const imports = ["_app/immutable/nodes/20.BMp-3qzY.js","_app/immutable/chunks/85pPpyzY.js","_app/immutable/chunks/BaKrtv6m.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=20-zsN03P4j.js.map
