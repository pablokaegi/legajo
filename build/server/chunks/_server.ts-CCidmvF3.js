import { h as puedeVerCurso } from './authz-CrGwa8A2.js';
import { t as toMoodleErrorMessage } from './client-BJtlkHyJ.js';
import { b as listarAlumnosDeCurso } from './cursos2-mJdtD_zg.js';
import { json } from '@sveltejs/kit';
import './db-DpfkJINj.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/api/moodle/cursos/[id]/alumnos/+server.ts
var GET = async ({ params, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	const cursoId = parseInt(params.id, 10);
	if (isNaN(cursoId)) return json({ error: "ID de curso invalido" }, { status: 400 });
	if (!await puedeVerCurso(locals.usuario.usuarioId)) return json({ error: "No autorizado" }, { status: 403 });
	try {
		return json(await listarAlumnosDeCurso(cursoId));
	} catch (err) {
		return json({ error: toMoodleErrorMessage(err) }, { status: 503 });
	}
};

export { GET };
//# sourceMappingURL=_server.ts-CCidmvF3.js.map
