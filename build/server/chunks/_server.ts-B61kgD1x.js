import { t as toMoodleErrorMessage } from './client-Cg7YvpsO.js';
import { l as listarCursos } from './cursos-CCgXIkSH.js';
import { json } from '@sveltejs/kit';
import './shared-server-9-2j12mp.js';
import './db-D9cZesji.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/api/moodle/cursos/+server.ts
var GET = async ({ locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	try {
		return json(await listarCursos());
	} catch (err) {
		return json({ error: toMoodleErrorMessage(err) }, { status: 503 });
	}
};

export { GET };
//# sourceMappingURL=_server.ts-B61kgD1x.js.map
