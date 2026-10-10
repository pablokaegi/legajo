import { r as registrarAccion, i as ipDe } from './audit-DcTc3_qL.js';
import { N as NuevaAmonestacionSchema, c as crearAmonestacion } from './amonestaciones--X3kfb9W.js';
import { l as listarCursosPreceptoria } from './cursos2-BTSWVjNq.js';
import { redirect, fail } from '@sveltejs/kit';
import './db-DnDhVbjt.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';
import './client-CURRDhAR.js';

//#region src/routes/preceptor/amonestaciones/nueva/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const cursos = await listarCursosPreceptoria().catch(() => []);
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

const index = 48;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CkjRkno0.js')).default;
const server_id = "src/routes/preceptor/amonestaciones/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/48.B89PCvAv.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/BI88GkAg.js","_app/immutable/chunks/BpBdz8fz.js","_app/immutable/chunks/BrKMbrgq.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=48-_bShb7W0.js.map
