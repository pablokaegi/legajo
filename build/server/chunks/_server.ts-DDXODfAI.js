import { l as esDirectivo, h as alcanceCursos, p as puedeVerCurso } from './authz-BVdVv-6k.js';
import { v as verificarAlumnosDelCurso } from './cursos2-pDrqIz-A.js';
import { o as obtenerHistorialFiltrado, O as ObservacionSchema, c as crearObservacion } from './observaciones-B9bJRDH-.js';
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

//#region src/routes/api/observaciones/+server.ts
var GET = async ({ url, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	const alumno = url.searchParams.get("alumno")?.trim() || void 0;
	const curso = url.searchParams.get("curso")?.trim() || void 0;
	const [omitUsuarioFilter, cursosPermitidos] = await Promise.all([esDirectivo(locals.usuario.usuarioId), alcanceCursos(locals.usuario.usuarioId)]);
	return json(await obtenerHistorialFiltrado({
		usuarioId: locals.usuario.usuarioId,
		alumno,
		curso,
		omitUsuarioFilter,
		cursosPermitidos
	}));
};
var POST = async ({ request, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: "JSON invalido" }, { status: 400 });
	}
	const parsed = ObservacionSchema.safeParse(body);
	if (!parsed.success) return json({
		error: "Datos invalidos",
		details: parsed.error.flatten()
	}, { status: 422 });
	const { cursoMoodleId, alumnoMoodleId } = parsed.data;
	if (!await puedeVerCurso(locals.usuario.usuarioId, cursoMoodleId)) return json({ error: "No tenés permiso para registrar observaciones en este curso." }, { status: 403 });
	let padron;
	try {
		padron = await verificarAlumnosDelCurso(cursoMoodleId, [alumnoMoodleId]);
	} catch {
		return json({ error: "No se pudo verificar la matrícula en Moodle." }, { status: 503 });
	}
	if (!padron) return json({ error: "El alumno no pertenece al curso." }, { status: 400 });
	return json({ id: await crearObservacion(locals.usuario.usuarioId, {
		...parsed.data,
		cursoNombre: padron.cursoNombre,
		alumnoNombre: padron.alumnos[0].alumnoNombre
	}) }, { status: 201 });
};

export { GET, POST };
//# sourceMappingURL=_server.ts-DDXODfAI.js.map
