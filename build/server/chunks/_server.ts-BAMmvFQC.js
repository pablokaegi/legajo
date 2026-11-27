import { p as puedeVerCurso } from './authz-BVdVv-6k.js';
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
import './client-Dsrb4zGp.js';

//#region src/routes/api/moodle/cursos/[id]/alumnos/+server.ts
var GET = async ({ params, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	const cursoId = Number(params.id);
	if (!Number.isSafeInteger(cursoId) || cursoId <= 0) return json({ error: "ID de curso invalido" }, { status: 400 });
	if (!await puedeVerCurso(locals.usuario.usuarioId, cursoId)) return json({ error: "No autorizado" }, { status: 403 });
	try {
		return json(await listarAlumnosDeCurso(cursoId));
	} catch (err) {
		return json({ error: toMoodleErrorMessage(err) }, { status: 503 });
	}
};

export { GET };
//# sourceMappingURL=_server.ts-BAMmvFQC.js.map
