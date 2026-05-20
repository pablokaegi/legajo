import { k as puedeVerFaltas, j as puedeGestionarFaltas } from './authz-qx5pRuic.js';
import { r as registrarAccion, i as ipDe } from './audit-DIlYjN0S.js';
import { a as listarFaltas, N as NuevaFaltaSchema, c as crearFalta } from './faltas-B3sMOCs_.js';
import { json } from '@sveltejs/kit';
import './db-C42nfPYx.js';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';

//#region src/routes/api/faltas/+server.ts
var GET = async ({ url, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (!await puedeVerFaltas(locals.usuario.usuarioId)) return json({ error: "Sin permiso" }, { status: 403 });
	return json(await listarFaltas({
		cursoMoodleId: url.searchParams.get("curso") ? Number(url.searchParams.get("curso")) : void 0,
		alumnoMoodleId: url.searchParams.get("alumno") ? Number(url.searchParams.get("alumno")) : void 0,
		page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : 1
	}));
};
var POST = async ({ request, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (!await puedeGestionarFaltas(locals.usuario.usuarioId)) return json({ error: "Solo preceptores y directivos pueden registrar faltas" }, { status: 403 });
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: "JSON inválido" }, { status: 400 });
	}
	const parsed = NuevaFaltaSchema.safeParse(body);
	if (!parsed.success) return json({
		error: "Datos inválidos",
		details: parsed.error.flatten()
	}, { status: 422 });
	const id = await crearFalta(locals.usuario.usuarioId, parsed.data);
	await registrarAccion({
		usuarioId: locals.usuario.usuarioId,
		accion: "crear_falta",
		tablaDestino: "faltas",
		idDestino: id,
		payload: {
			tipo: parsed.data.tipo,
			alumnos: parsed.data.alumnos.length
		},
		ip: ipDe(request)
	});
	return json({ id }, { status: 201 });
};

export { GET, POST };
//# sourceMappingURL=_server.ts-C5P8c8gx.js.map
