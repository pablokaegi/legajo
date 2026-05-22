import { i as puedeVerAlumno } from './authz-3kjxFg8F.js';
import { m as moodle, t as toMoodleErrorMessage } from './client-Caj_4xk9.js';
import { json } from '@sveltejs/kit';
import './db-BwwlYHWL.js';
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
	const courseId = parseInt(params.id, 10);
	const userId = parseInt(params.alumnoId, 10);
	if (isNaN(courseId) || isNaN(userId)) return json({ error: "IDs invalidos" }, { status: 400 });
	if (!await puedeVerAlumno(locals.usuario.usuarioId, userId)) return json({ error: "No autorizado" }, { status: 403 });
	try {
		return json(await moodle.getGradeItems(courseId, userId));
	} catch (err) {
		return json({ error: toMoodleErrorMessage(err) }, { status: 503 });
	}
};

export { GET };
//# sourceMappingURL=_server.ts-rg-hCkKZ.js.map
