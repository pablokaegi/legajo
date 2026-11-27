import { g as puedeVerAmonestaciones, h as alcanceCursos, i as puedeGestionarAmonestaciones, j as alcancePreceptoria } from './authz-BVdVv-6k.js';
import { r as registrarAccion, i as ipDe } from './audit-Dz9I-BN1.js';
import { l as listarAmonestaciones, N as NuevaAmonestacionSchema, c as crearAmonestacion } from './amonestaciones-C_Z8PIPM.js';
import { v as verificarAlumnosDelCurso } from './cursos2-pDrqIz-A.js';
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
import './client-Dsrb4zGp.js';
import './rest-qugARKMk.js';

//#region src/routes/api/amonestaciones/+server.ts
var GET = async ({ url, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (!await puedeVerAmonestaciones(locals.usuario.usuarioId)) return json({ error: "Sin permiso" }, { status: 403 });
	const alumno = url.searchParams.get("alumno") ? Number(url.searchParams.get("alumno")) : void 0;
	const gravedad = url.searchParams.get("gravedad") ?? void 0;
	const page = url.searchParams.get("page") ? Number(url.searchParams.get("page")) : 1;
	return json(await listarAmonestaciones({
		alumnoMoodleId: alumno,
		gravedad,
		cursosPermitidos: await alcanceCursos(locals.usuario.usuarioId),
		page
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
	const { cursoMoodleId, alumnoMoodleId } = parsed.data;
	const cursos = await alcancePreceptoria(locals.usuario.usuarioId);
	if (cursos && (!cursoMoodleId || !cursos.includes(cursoMoodleId))) return json({ error: "Elegí un curso asignado a tu rol de preceptoría." }, { status: 403 });
	if (cursoMoodleId) {
		let padron;
		try {
			padron = await verificarAlumnosDelCurso(cursoMoodleId, [alumnoMoodleId]);
		} catch {
			return json({ error: "No se pudo verificar la matrícula en Moodle." }, { status: 503 });
		}
		if (!padron) return json({ error: "El alumno no pertenece al curso." }, { status: 400 });
		parsed.data.cursoNombre = padron.cursoNombre;
		parsed.data.alumnoNombre = padron.alumnos[0].alumnoNombre;
	}
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
//# sourceMappingURL=_server.ts-BPXDvKBG.js.map
