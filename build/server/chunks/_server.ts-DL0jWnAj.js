import { p as puedeVerActas, b as puedeEditarActa } from './authz-CM_w6bbu.js';
import { o as obtenerActaCompleta, u as usuarioPuedeVerActa, a as usuarioPuedeEditarActa, E as EditarActaSchema, e as editarActa } from './actas-BORYcJEU.js';
import { r as registrarAccion, i as ipDe } from './audit-CdmgQ4ca.js';
import { json } from '@sveltejs/kit';
import './db-BwfbdrtT.js';
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
	if (!await usuarioPuedeVerActa(locals.usuario.usuarioId, acta)) return json({ error: "Acta no encontrada" }, { status: 404 });
	return json(acta);
};
var PUT = async ({ params, request, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (!await puedeEditarActa(locals.usuario.usuarioId)) return json({ error: "Sin permiso para editar actas" }, { status: 403 });
	const id = parseInt(params.id, 10);
	if (isNaN(id)) return json({ error: "ID inválido" }, { status: 400 });
	if (!await usuarioPuedeEditarActa(locals.usuario.usuarioId, id)) return json({ error: "Acta no encontrada" }, { status: 404 });
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
//# sourceMappingURL=_server.ts-DL0jWnAj.js.map
