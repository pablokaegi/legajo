import { c as puedeVerAmonestaciones, d as puedeGestionarAmonestaciones } from './authz-Dr1pP5L1.js';
import { r as registrarAccion, i as ipDe } from './audit--5ksYK0e.js';
import { l as listarAmonestaciones, N as NuevaAmonestacionSchema, c as crearAmonestacion } from './amonestaciones-CUgkhAS7.js';
import { json } from '@sveltejs/kit';
import './db-BEC8cTGI.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';

//#region src/routes/api/amonestaciones/+server.ts
var GET = async ({ url, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (!await puedeVerAmonestaciones(locals.usuario.usuarioId)) return json({ error: "Sin permiso" }, { status: 403 });
	return json(await listarAmonestaciones({
		alumnoMoodleId: url.searchParams.get("alumno") ? Number(url.searchParams.get("alumno")) : void 0,
		gravedad: url.searchParams.get("gravedad") ?? void 0,
		page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : 1
	}));
};
var POST = async ({ request, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (!await puedeGestionarAmonestaciones(locals.usuario.usuarioId)) return json({ error: "Solo preceptores y directivos pueden registrar amonestaciones" }, { status: 403 });
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: "JSON inválido" }, { status: 400 });
	}
	const parsed = NuevaAmonestacionSchema.safeParse(body);
	if (!parsed.success) return json({
		error: "Datos inválidos",
		details: parsed.error.flatten()
	}, { status: 422 });
	const id = await crearAmonestacion(locals.usuario.usuarioId, parsed.data);
	await registrarAccion({
		usuarioId: locals.usuario.usuarioId,
		accion: "crear_amonestacion",
		tablaDestino: "amonestaciones",
		idDestino: id,
		payload: {
			gravedad: parsed.data.gravedad,
			alumno: parsed.data.alumnoMoodleId
		},
		ip: ipDe(request)
	});
	return json({ id }, { status: 201 });
};

export { GET, POST };
//# sourceMappingURL=_server.ts-C7KVAIYC.js.map
