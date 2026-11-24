import { b as listarAlumnosDeCurso } from './cursos2-BuIc_Cww.js';
import { t as toMoodleErrorMessage } from './client-txz_W3Xb.js';
import { k as puedeVerCurso } from './authz-DQJuia-E.js';
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

// src/routes/api/moodle/cursos/[id]/alumnos/+server.ts
var GET = async ({ params, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	const cursoId = parseInt(params.id, 10);
	if (isNaN(cursoId)) return json({ error: "ID de curso invalido" }, { status: 400 });
	if (!await puedeVerCurso(locals.usuario.usuarioId)) return json({ error: "No autorizado" }, { status: 403 });
	try {
		const alumnos = await listarAlumnosDeCurso(cursoId);
		return json(alumnos);
	} catch (err) {
		return json({ error: toMoodleErrorMessage(err) }, { status: 503 });
	}
};

export { GET };
//# sourceMappingURL=_server.ts-BbRA1xZc.js.map
