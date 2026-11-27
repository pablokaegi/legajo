import { o as puedeVerNotasCurso } from './authz-BVdVv-6k.js';
import { m as moodle } from './client-Dsrb4zGp.js';
import { t as toMoodleErrorMessage } from './rest-qugARKMk.js';
import { b as listarAlumnosDeCurso } from './cursos2-pDrqIz-A.js';
import { json } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/api/moodle/cursos/[id]/alumnos/[alumnoId]/notas/+server.ts
var GET = async ({ params, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	const courseId = Number(params.id);
	const userId = Number(params.alumnoId);
	if (![courseId, userId].every((id) => Number.isSafeInteger(id) && id > 0)) return json({ error: "IDs invalidos" }, { status: 400 });
	if (!await puedeVerNotasCurso(locals.usuario.usuarioId, courseId, userId)) return json({ error: "No autorizado" }, { status: 403 });
	try {
		if (!(await listarAlumnosDeCurso(courseId)).some((a) => a.id === userId)) return json({ error: "El alumno no pertenece al curso." }, { status: 404 });
		return json(await moodle.getGradeItems(courseId, userId));
	} catch (err) {
		return json({ error: toMoodleErrorMessage(err) }, { status: 503 });
	}
};

export { GET };
//# sourceMappingURL=_server.ts-Zdl01E91.js.map
