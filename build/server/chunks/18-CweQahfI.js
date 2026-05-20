import { r as registrarAccion, i as ipDe } from './audit-ptP7jPlB.js';
import { N as NuevaFaltaSchema, c as crearFalta } from './faltas-C2Q-9o70.js';
import { l as listarCursos, a as listarAlumnosDeCurso } from './cursos-KiCjooEC.js';
import { redirect, fail } from '@sveltejs/kit';
import './db-XKMgjins.js';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';
import './client-B-Jh6LXU.js';

//#region src/routes/preceptor/faltas/nueva/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const cursos = await listarCursos().catch(() => []);
	const cursoIdParam = url.searchParams.get("cursoId");
	const cursoNombreParam = url.searchParams.get("cursoNombre");
	const alumnosParam = url.searchParams.get("alumnos");
	let preselect = null;
	if (cursoIdParam && alumnosParam) {
		const cursoId = parseInt(cursoIdParam, 10);
		const alumnoIds = new Set(alumnosParam.split(",").map(Number).filter((n) => !isNaN(n) && n > 0));
		if (!isNaN(cursoId) && alumnoIds.size > 0) {
			const found = (await listarAlumnosDeCurso(cursoId).catch(() => [])).filter((a) => alumnoIds.has(a.id));
			preselect = {
				cursoId,
				cursoNombre: cursoNombreParam ?? cursos.find((c) => c.id === cursoId)?.displayname ?? cursos.find((c) => c.id === cursoId)?.fullname ?? `Curso ${cursoId}`,
				alumnos: found.map((a) => ({
					id: a.id,
					fullname: a.fullname
				}))
			};
		}
	}
	return {
		cursos,
		preselect
	};
};
var actions = { default: async ({ request, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const form = await request.formData();
	const alumnosRaw = form.get("alumnos")?.toString() ?? "[]";
	let alumnos = [];
	try {
		alumnos = JSON.parse(alumnosRaw);
	} catch {
		return fail(400, { error: "Datos de alumnos inválidos" });
	}
	const input = {
		fecha: form.get("fecha")?.toString() ?? "",
		tipo: form.get("tipo")?.toString() ?? "",
		descripcion: form.get("descripcion")?.toString() || void 0,
		cursoMoodleId: parseInt(form.get("cursoMoodleId")?.toString() ?? "0", 10),
		cursoNombre: form.get("cursoNombre")?.toString() ?? "",
		visibilidad: form.get("visibilidad")?.toString() || "publica",
		alumnos
	};
	const parsed = NuevaFaltaSchema.safeParse(input);
	if (!parsed.success) return fail(422, {
		error: "Datos inválidos",
		details: parsed.error.flatten()
	});
	try {
		const id = await crearFalta(locals.usuario.usuarioId, parsed.data);
		await registrarAccion({
			usuarioId: locals.usuario.usuarioId,
			accion: "crear_falta",
			tablaDestino: "faltas",
			idDestino: id,
			ip: ipDe(request)
		});
	} catch (err) {
		return fail(500, { error: err instanceof Error ? err.message : "Error al guardar" });
	}
	throw redirect(303, "/preceptor/faltas");
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 18;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-C0m93G9D.js')).default;
const server_id = "src/routes/preceptor/faltas/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/18.CvHOfcUD.js","_app/immutable/chunks/BCmZRGrY.js","_app/immutable/chunks/DZT7GpYL.js","_app/immutable/chunks/CgXVuoOo.js","_app/immutable/chunks/BS0xk4ku.js","_app/immutable/chunks/2TU3FloQ.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=18-CweQahfI.js.map
