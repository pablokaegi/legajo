import { o as obtenerHistorialFiltrado, O as ObservacionSchema, c as crearObservacion } from './observaciones-t8-khaPX.js';
import { e as esDirectivo, b as puedeCrearObservacion } from './authz-BKiCLRVr.js';
import { json } from '@sveltejs/kit';
import './db-D9cZesji.js';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';

//#region src/routes/api/observaciones/+server.ts
var GET = async ({ url, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	const alumno = url.searchParams.get("alumno")?.trim() || void 0;
	const curso = url.searchParams.get("curso")?.trim() || void 0;
	const omitUsuarioFilter = await esDirectivo(locals.usuario.usuarioId);
	return json(await obtenerHistorialFiltrado({
		usuarioId: locals.usuario.usuarioId,
		alumno,
		curso,
		omitUsuarioFilter
	}));
};
var POST = async ({ request, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (!await puedeCrearObservacion(locals.usuario.usuarioId)) return json({ error: "No tenes permiso para crear observaciones" }, { status: 403 });
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: "JSON invalido" }, { status: 400 });
	}
	const parsed = ObservacionSchema.safeParse(body);
	if (!parsed.success) return json({
		error: "Datos invalidos",
		details: parsed.error.flatten()
	}, { status: 422 });
	return json({ id: await crearObservacion(locals.usuario.usuarioId, parsed.data) }, { status: 201 });
};

export { GET, POST };
//# sourceMappingURL=_server.ts-BYD4E6Qn.js.map
