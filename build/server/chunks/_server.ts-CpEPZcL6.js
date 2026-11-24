import { l as listarActas, N as NuevaActaSchema, c as crearActa } from './actas-GmZRa6-X.js';
import { p as puedeVerActas, a as esDirectivoOAdmin, c as puedeCrearActa } from './authz-DQJuia-E.js';
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

// src/routes/api/actas/+server.ts
var GET = async ({ url, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (!await puedeVerActas(locals.usuario.usuarioId)) return json({ error: "Sin permiso" }, { status: 403 });
	const estado = url.searchParams.get("estado") ?? void 0;
	const page = url.searchParams.get("page") ? Number(url.searchParams.get("page")) : 1;
	const verTodas = await esDirectivoOAdmin(locals.usuario.usuarioId);
	const rows = await listarActas({
		estado,
		page,
		usuarioId: locals.usuario.usuarioId,
		verTodas
	});
	return json(rows);
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
//# sourceMappingURL=_server.ts-CpEPZcL6.js.map
