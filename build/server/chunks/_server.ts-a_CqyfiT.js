import { l as listarFaltas, N as NuevaFaltaSchema, c as crearFalta } from './faltas-CoyjjzsK.js';
import { j as puedeVerFaltas, h as puedeGestionarFaltas } from './authz-DQJuia-E.js';
import { r as registrarAccion, i as ipDe } from './audit-DjKqoMaH.js';
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

// src/routes/api/faltas/+server.ts
var GET = async ({ url, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (!await puedeVerFaltas(locals.usuario.usuarioId)) return json({ error: "Sin permiso" }, { status: 403 });
	const curso = url.searchParams.get("curso") ? Number(url.searchParams.get("curso")) : void 0;
	const alumno = url.searchParams.get("alumno") ? Number(url.searchParams.get("alumno")) : void 0;
	const page = url.searchParams.get("page") ? Number(url.searchParams.get("page")) : 1;
	const rows = await listarFaltas({
		cursoMoodleId: curso,
		alumnoMoodleId: alumno,
		page
	});
	return json(rows);
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
//# sourceMappingURL=_server.ts-a_CqyfiT.js.map
