import { l as listarActas, N as NuevaActaSchema, c as crearActa } from './actas-Bq2BFwn_.js';
import { p as puedeVerActas, a as puedeCrearActa } from './authz-CrGwa8A2.js';
import { r as registrarAccion, i as ipDe } from './audit-CJXZq2EH.js';
import { json } from '@sveltejs/kit';
import './db-DpfkJINj.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';

//#region src/routes/api/actas/+server.ts
var GET = async ({ url, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (!await puedeVerActas(locals.usuario.usuarioId)) return json({ error: "Sin permiso" }, { status: 403 });
	return json(await listarActas({
		estado: url.searchParams.get("estado") ?? void 0,
		page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : 1
	}));
};
var POST = async ({ request, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (!await puedeCrearActa(locals.usuario.usuarioId)) return json({ error: "Solo preceptores y directivos pueden crear actas" }, { status: 403 });
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: "JSON inválido" }, { status: 400 });
	}
	const parsed = NuevaActaSchema.safeParse(body);
	if (!parsed.success) return json({
		error: "Datos inválidos",
		details: parsed.error.flatten()
	}, { status: 422 });
	const id = await crearActa(locals.usuario.usuarioId, parsed.data);
	await registrarAccion({
		usuarioId: locals.usuario.usuarioId,
		accion: "crear_acta",
		tablaDestino: "actas",
		idDestino: id,
		payload: { titulo: parsed.data.titulo },
		ip: ipDe(request)
	});
	return json({ id }, { status: 201 });
};

export { GET, POST };
//# sourceMappingURL=_server.ts-BEwjm2H4.js.map
