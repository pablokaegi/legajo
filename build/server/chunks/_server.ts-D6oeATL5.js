import { o as obtenerHistorialFiltrado, O as ObservacionSchema, c as crearObservacion } from './observaciones-DsqwgVKb.js';
import { i as esDirectivo, m as puedeCrearObservacion } from './authz-DQJuia-E.js';
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
import 'zod';

// src/routes/api/observaciones/+server.ts
var GET = async ({ url, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	const alumno = url.searchParams.get("alumno")?.trim() || void 0;
	const curso = url.searchParams.get("curso")?.trim() || void 0;
	const omitUsuarioFilter = await esDirectivo(locals.usuario.usuarioId);
	const obs = await obtenerHistorialFiltrado({
		usuarioId: locals.usuario.usuarioId,
		alumno,
		curso,
		omitUsuarioFilter
	});
	return json(obs);
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
	const id = await crearObservacion(locals.usuario.usuarioId, parsed.data);
	return json({ id }, { status: 201 });
};

export { GET, POST };
//# sourceMappingURL=_server.ts-D6oeATL5.js.map
