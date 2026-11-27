import { p as puedeVerCurso, j as alcancePreceptoria } from './authz-BVdVv-6k.js';
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
import './client-Dsrb4zGp.js';

//#region src/routes/cursos/[id]/+page.server.ts
var load = async ({ params, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const cursoId = Number(params.id);
	if (!Number.isSafeInteger(cursoId) || cursoId <= 0) error(400, "ID de curso inválido");
	if (!await puedeVerCurso(locals.usuario.usuarioId, cursoId)) error(403, "No tenes permiso para ver este curso");
	const preceptoria = await alcancePreceptoria(locals.usuario.usuarioId);
	const puedePreceptoria = preceptoria === null || preceptoria.includes(cursoId);
	const puedeReincorporar = preceptoria === null;
	let cursoNombre = `Curso ${cursoId}`;
	try {
		const [alumnos, cursos] = await Promise.all([listarAlumnosDeCurso(cursoId), listarCursos().catch(() => [])]);
		const curso = cursos.find((c) => c.id === cursoId);
		if (curso) cursoNombre = curso.displayname || curso.fullname;
		return {
			alumnos,
			cursoId,
			cursoNombre,
			puedePreceptoria,
			puedeReincorporar,
			error: null
		};
	} catch (err) {
		return {
			alumnos: [],
			cursoId,
			cursoNombre,
			puedePreceptoria,
			puedeReincorporar,
			error: toMoodleErrorMessage(err)
		};
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 25;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BBGHMZi5.js')).default;
const server_id = "src/routes/cursos/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/25.D-8c8wPM.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=25-D2oF18du.js.map
