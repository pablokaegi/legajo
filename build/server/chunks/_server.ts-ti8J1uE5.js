import { n as cursosVisiblesPara } from './authz-BVdVv-6k.js';
import { t as toMoodleErrorMessage } from './rest-qugARKMk.js';
import { a as listarCursos } from './cursos2-pDrqIz-A.js';
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

//#region src/routes/api/moodle/cursos/+server.ts
var GET = async ({ locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	try {
		return json(await cursosVisiblesPara(locals.usuario.usuarioId, await listarCursos()));
	} catch (err) {
		return json({ error: toMoodleErrorMessage(err) }, { status: 503 });
	}
};

export { GET };
//# sourceMappingURL=_server.ts-ti8J1uE5.js.map
