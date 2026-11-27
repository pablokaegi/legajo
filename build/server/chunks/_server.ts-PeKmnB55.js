import { m as puedeVerFaltas, h as alcanceCursos, k as puedeGestionarPreceptoriaCurso } from './authz-BVdVv-6k.js';
import { r as registrarAccion, i as ipDe } from './audit-Dz9I-BN1.js';
import { v as verificarAlumnosDelCurso } from './cursos2-pDrqIz-A.js';
import { l as listarFaltas, N as NuevaFaltaSchema, c as crearFalta } from './faltas-Ca0YAQ6-.js';
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
import './client-Dsrb4zGp.js';
import './rest-qugARKMk.js';
import 'zod';

//#region src/routes/api/faltas/+server.ts
var GET = async ({ url, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (!await puedeVerFaltas(locals.usuario.usuarioId)) return json({ error: "Sin permiso" }, { status: 403 });
	const curso = url.searchParams.get("curso") ? Number(url.searchParams.get("curso")) : void 0;
	const alumno = url.searchParams.get("alumno") ? Number(url.searchParams.get("alumno")) : void 0;
	const page = url.searchParams.get("page") ? Number(url.searchParams.get("page")) : 1;
	return json(await listarFaltas({
		cursoMoodleId: curso,
		alumnoMoodleId: alumno,
		cursosPermitidos: await alcanceCursos(locals.usuario.usuarioId),
		page
	}));
};
var POST = async ({ request, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
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
	const { cursoMoodleId, alumnos } = parsed.data;
	if (!await puedeGestionarPreceptoriaCurso(locals.usuario.usuarioId, cursoMoodleId)) return json({ error: "No tenés permisos de preceptoría para este curso." }, { status: 403 });
	let padron;
	try {
		padron = await verificarAlumnosDelCurso(cursoMoodleId, alumnos.map((a) => a.alumnoMoodleId));
	} catch {
		return json({ error: "No se pudo verificar la matrícula en Moodle." }, { status: 503 });
	}
	if (!padron) return json({ error: "Algún alumno no pertenece al curso." }, { status: 400 });
	const notas = new Map(alumnos.map((a) => [a.alumnoMoodleId, a.nota]));
	const id = await crearFalta(locals.usuario.usuarioId, {
		...parsed.data,
		cursoNombre: padron.cursoNombre,
		alumnos: padron.alumnos.map((a) => ({
			...a,
			nota: notas.get(a.alumnoMoodleId)
		}))
	});
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
//# sourceMappingURL=_server.ts-PeKmnB55.js.map
