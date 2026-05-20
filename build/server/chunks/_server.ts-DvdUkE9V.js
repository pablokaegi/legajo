import { d as db, l as jobs } from './db-XKMgjins.js';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';

//#region src/routes/api/jobs/[id]/+server.ts
var GET = async ({ params, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	const [job] = await db.select().from(jobs).where(eq(jobs.id, params.id)).limit(1);
	if (!job) return json({ error: "Job no encontrado" }, { status: 404 });
	if (job.usuarioId !== locals.usuario.usuarioId) return json({ error: "Sin permiso" }, { status: 403 });
	return json({
		id: job.id,
		tipo: job.tipo,
		estado: job.estado,
		total: job.total,
		procesados: job.procesados,
		errores: job.errores,
		progreso: job.total > 0 ? Math.round(job.procesados / job.total * 100) : 0,
		resultado: job.resultadoJson ? JSON.parse(job.resultadoJson) : null,
		createdAt: job.createdAt,
		updatedAt: job.updatedAt
	});
};

export { GET };
//# sourceMappingURL=_server.ts-DvdUkE9V.js.map
