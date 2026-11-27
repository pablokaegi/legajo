import { o as puedeVerNotasCurso } from './authz-BVdVv-6k.js';
import { m as moodle } from './client-Dsrb4zGp.js';
import { t as toMoodleErrorMessage } from './rest-qugARKMk.js';
import { b as listarAlumnosDeCurso, a as listarCursos } from './cursos2-pDrqIz-A.js';
import { redirect, error } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/cursos/[id]/alumnos/[alumnoId]/notas/+page.server.ts
var load = async ({ params, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const courseId = Number(params.id);
	const userId = Number(params.alumnoId);
	if (![courseId, userId].every((id) => Number.isSafeInteger(id) && id > 0)) error(400, "IDs inválidos");
	if (!await puedeVerNotasCurso(locals.usuario.usuarioId, courseId, userId)) error(403, "No tenés permiso para ver estas notas");
	const [alumnos, cursos] = await Promise.all([listarAlumnosDeCurso(courseId).catch(() => null), listarCursos().catch(() => [])]);
	if (alumnos === null) error(503, "No se pudo verificar la matrícula en Moodle.");
	const alumno = alumnos.find((a) => a.id === userId);
	if (!alumno) error(404, "El alumno no pertenece al curso.");
	const alumnoNombre = alumno.fullname;
	const curso = cursos.find((c) => c.id === courseId);
	const cursoNombre = curso ? curso.displayname || curso.fullname : `Curso ${courseId}`;
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

const index = 26;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B-ZJGIRC.js')).default;
const server_id = "src/routes/cursos/[id]/alumnos/[alumnoId]/notas/+page.server.ts";
const imports = ["_app/immutable/nodes/26.Yc5J8Cyu.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=26-69ACQ4AA.js.map
