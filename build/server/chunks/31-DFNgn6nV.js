import { r as registrarAccion, i as ipDe } from './audit-BX1KYP_P.js';
import { N as NuevaAmonestacionSchema, c as crearAmonestacion } from './amonestaciones-DXl1Aq3r.js';
import { l as listarCursos } from './cursos2-CsA1lmu1.js';
import { redirect, fail } from '@sveltejs/kit';
import './db-BwwlYHWL.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';
import './client-Caj_4xk9.js';

//#region src/routes/preceptor/amonestaciones/nueva/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const cursos = await listarCursos().catch(() => []);
	const alumnoIdParam = url.searchParams.get("alumnoId");
	const cursoIdParam = url.searchParams.get("cursoId");
	return {
		cursos,
		preselect: {
			alumnoMoodleId: alumnoIdParam ? Number(alumnoIdParam) : null,
			alumnoNombre: url.searchParams.get("alumnoNombre") ?? null,
			cursoMoodleId: cursoIdParam ? Number(cursoIdParam) : null,
			cursoNombre: url.searchParams.get("cursoNombre") ?? null
		}
	};
};
var actions = { default: async ({ request, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
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

const index = 31;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-C34GBCiZ.js')).default;
const server_id = "src/routes/preceptor/amonestaciones/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/31.COs_J6SX.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/D1t-vr8V.js","_app/immutable/chunks/DuG0JUWg.js","_app/immutable/chunks/QlI9inmL.js","_app/immutable/chunks/BEDIq91W.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=31-DFNgn6nV.js.map
