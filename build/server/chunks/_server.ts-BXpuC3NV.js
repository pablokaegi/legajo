import { j as alcancePreceptoria } from './authz-BVdVv-6k.js';
import { r as registrarAccion, i as ipDe } from './audit-Dz9I-BN1.js';
import { l as listarReincorporaciones, N as NuevaReincorporacionSchema, c as crearReincorporacion } from './reincorporaciones-dbLXsgJn.js';
import { json } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';

//#region src/routes/api/reincorporaciones/+server.ts
var GET = async ({ url, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (await alcancePreceptoria(locals.usuario.usuarioId) !== null) return json({ error: "Este registro requiere acceso institucional." }, { status: 403 });
	return json(await listarReincorporaciones({
		alumnoMoodleId: url.searchParams.get("alumno") ? Number(url.searchParams.get("alumno")) : void 0,
		page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : 1
	}));
};
var POST = async ({ request, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (await alcancePreceptoria(locals.usuario.usuarioId) !== null) return json({ error: "Este registro requiere acceso institucional." }, { status: 403 });
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: "JSON inválido" }, { status: 400 });
	}
	const parsed = NuevaReincorporacionSchema.safeParse(body);
	if (!parsed.success) return json({
		error: "Datos inválidos",
		details: parsed.error.flatten()
	}, { status: 422 });
	const id = await crearReincorporacion(locals.usuario.usuarioId, parsed.data);
	await registrarAccion({
		usuarioId: locals.usuario.usuarioId,
		accion: "crear_reincorporacion",
		tablaDestino: "reincorporaciones",
		idDestino: id,
		payload: { alumno: parsed.data.alumnoMoodleId },
		ip: ipDe(request)
	});
	return json({ id }, { status: 201 });
};

export { GET, POST };
//# sourceMappingURL=_server.ts-BXpuC3NV.js.map
