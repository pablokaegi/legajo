import { o as obtenerActaCompleta, E as EditarActaSchema, e as editarActa } from './actas-B2HOgg6e.js';
import { p as puedeVerActas, b as puedeEditarActa } from './authz-Dj2ibWv-.js';
import { r as registrarAccion, i as ipDe } from './audit-BWcEzTuC.js';
import { json } from '@sveltejs/kit';
import './db-Baevsgh0.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';

//#region src/routes/api/actas/[id]/+server.ts
var GET = async ({ params, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (!await puedeVerActas(locals.usuario.usuarioId)) return json({ error: "Sin permiso" }, { status: 403 });
	const id = parseInt(params.id, 10);
	if (isNaN(id)) return json({ error: "ID inválido" }, { status: 400 });
	const acta = await obtenerActaCompleta(id);
	if (!acta) return json({ error: "Acta no encontrada" }, { status: 404 });
	return json(acta);
};
var PUT = async ({ params, request, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (!await puedeEditarActa(locals.usuario.usuarioId)) return json({ error: "Sin permiso para editar actas" }, { status: 403 });
	const id = parseInt(params.id, 10);
	if (isNaN(id)) return json({ error: "ID inválido" }, { status: 400 });
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: "JSON inválido" }, { status: 400 });
	}
	const parsed = EditarActaSchema.safeParse(body);
	if (!parsed.success) return json({
		error: "Datos inválidos",
		details: parsed.error.flatten()
	}, { status: 422 });
	try {
		await editarActa(id, locals.usuario.usuarioId, parsed.data);
	} catch (err) {
		const msg = err instanceof Error ? err.message : "Error";
		if (msg === "Acta no encontrada") return json({ error: msg }, { status: 404 });
		throw err;
	}
	await registrarAccion({
		usuarioId: locals.usuario.usuarioId,
		accion: "editar_acta",
		tablaDestino: "actas",
		idDestino: id,
		ip: ipDe(request)
	});
	return json({ ok: true });
};

export { GET, PUT };
//# sourceMappingURL=_server.ts-Cs_kANtt.js.map
