import { i as puedeGestionarAmonestaciones, j as alcancePreceptoria } from './authz-BVdVv-6k.js';
import { r as registrarAccion, i as ipDe } from './audit-Dz9I-BN1.js';
import { N as NuevaAmonestacionSchema, c as crearAmonestacion } from './amonestaciones-C_Z8PIPM.js';
import { v as verificarAlumnosDelCurso, l as listarCursosPreceptoria, b as listarAlumnosDeCurso } from './cursos2-pDrqIz-A.js';
import { redirect, fail } from '@sveltejs/kit';
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

//#region src/routes/preceptor/amonestaciones/nueva/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const permitidos = await alcancePreceptoria(locals.usuario.usuarioId);
	const cursos = (await listarCursosPreceptoria().catch(() => [])).filter((curso) => !permitidos || permitidos.includes(curso.id));
	const alumnoId = Number(url.searchParams.get("alumnoId"));
	const curso = cursos.find((c) => c.id === Number(url.searchParams.get("cursoId")));
	const alumno = (curso && alumnoId > 0 ? await listarAlumnosDeCurso(curso.id).catch(() => []) : []).find((a) => a.id === alumnoId);
	const sinCursoLegacy = !permitidos && !url.searchParams.has("cursoId") && alumnoId > 0;
	return {
		cursos,
		preselect: {
			alumnoMoodleId: alumno?.id ?? (sinCursoLegacy ? alumnoId : null),
			alumnoNombre: alumno?.fullname ?? (sinCursoLegacy ? url.searchParams.get("alumnoNombre") : null),
			cursoMoodleId: curso?.id ?? null,
			cursoNombre: (curso?.displayname || curso?.fullname) ?? null
		}
	};
};
var actions = { default: async ({ request, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	if (!await puedeGestionarAmonestaciones(locals.usuario.usuarioId)) return fail(403, { error: "Sin permiso." });
	const form = await request.formData();
	const input = {
		alumnoMoodleId: parseInt(form.get("alumnoMoodleId")?.toString() ?? "0", 10),
		alumnoNombre: form.get("alumnoNombre")?.toString() ?? "",
		fecha: form.get("fecha")?.toString() ?? "",
		gravedad: form.get("gravedad")?.toString() ?? "",
		motivo: form.get("motivo")?.toString() ?? "",
		accionesSugeridas: form.get("accionesSugeridas")?.toString() || void 0,
		cursoMoodleId: form.get("cursoMoodleId") ? parseInt(form.get("cursoMoodleId").toString(), 10) : void 0,
		cursoNombre: form.get("cursoNombre")?.toString() || void 0
	};
	const parsed = NuevaAmonestacionSchema.safeParse(input);
	if (!parsed.success) return fail(422, {
		error: "Datos inválidos",
		details: parsed.error.flatten()
	});
	const { cursoMoodleId, alumnoMoodleId } = parsed.data;
	const cursos = await alcancePreceptoria(locals.usuario.usuarioId);
	if (cursos && (!cursoMoodleId || !cursos.includes(cursoMoodleId))) return fail(403, { error: "Elegí un curso asignado a tu rol de preceptoría." });
	if (cursoMoodleId) {
		let padron;
		try {
			padron = await verificarAlumnosDelCurso(cursoMoodleId, [alumnoMoodleId]);
		} catch {
			return fail(503, { error: "No se pudo verificar la matrícula en Moodle." });
		}
		if (!padron) return fail(400, { error: "El alumno no pertenece al curso." });
		parsed.data.cursoNombre = padron.cursoNombre;
		parsed.data.alumnoNombre = padron.alumnos[0].alumnoNombre;
	}
	try {
		const id = await crearAmonestacion(locals.usuario.usuarioId, parsed.data);
		await registrarAccion({
			usuarioId: locals.usuario.usuarioId,
			accion: "crear_amonestacion",
			tablaDestino: "amonestaciones",
			idDestino: id,
			ip: ipDe(request)
		});
	} catch (err) {
		return fail(500, { error: err instanceof Error ? err.message : "Error al guardar" });
	}
	throw redirect(303, "/preceptor/amonestaciones");
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 58;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CRu0FT_w.js')).default;
const server_id = "src/routes/preceptor/amonestaciones/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/58.CJpGgJN1.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/B8RcQQp0.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/M6KOCQrT.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=58-DoJCCV5F.js.map
