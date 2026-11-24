import { m as moodle, t as toMoodleErrorMessage } from './client-txz_W3Xb.js';
import { l as puedeVerAlumno } from './authz-DQJuia-E.js';
import { json } from '@sveltejs/kit';
import './db-D7hI4G6x.js';
import './index.js-D6_LEqEo.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

// src/routes/api/moodle/cursos/[id]/alumnos/[alumnoId]/notas/+server.ts
var GET = async ({ params, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	const courseId = parseInt(params.id, 10);
	const userId = parseInt(params.alumnoId, 10);
	if (isNaN(courseId) || isNaN(userId)) return json({ error: "IDs invalidos" }, { status: 400 });
	if (!await puedeVerAlumno(locals.usuario.usuarioId, userId)) return json({ error: "No autorizado" }, { status: 403 });
	try {
		const grades = await moodle.getGradeItems(courseId, userId);
		return json(grades);
	} catch (err) {
		return json({ error: toMoodleErrorMessage(err) }, { status: 503 });
	}
};

export { GET };
//# sourceMappingURL=_server.ts-1KvOYrcY.js.map
