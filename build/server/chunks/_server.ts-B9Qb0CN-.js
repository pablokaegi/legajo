import { t as toMoodleErrorMessage } from './client-BJtlkHyJ.js';
import { a as listarCursos } from './cursos2-mJdtD_zg.js';
import { json } from '@sveltejs/kit';
import './shared-server-asDUS7ug.js';
import './db-DpfkJINj.js';
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
//# sourceMappingURL=_server.ts-B9Qb0CN-.js.map
