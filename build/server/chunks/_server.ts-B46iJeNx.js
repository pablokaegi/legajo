import { d as db, B as jobs } from './db-D7hI4G6x.js';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import './index.js-D6_LEqEo.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';

// src/routes/api/jobs/[id]/+server.ts
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
//# sourceMappingURL=_server.ts-B46iJeNx.js.map
