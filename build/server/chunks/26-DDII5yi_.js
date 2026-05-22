import { c as crearSalida } from './salidas-Boxs1Xl7.js';
import { redirect, fail } from '@sveltejs/kit';
import './db-BwfbdrtT.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'node:crypto';

//#region src/routes/institucional/salidas/nueva/+page.server.ts
var load = async ({ locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	return {};
};
var actions = { default: async ({ request, locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const fd = await request.formData();
	const titulo = fd.get("titulo")?.trim();
	const fecha = fd.get("fecha")?.trim();
	const destino = fd.get("destino")?.trim();
	const responsableNombre = fd.get("responsableNombre")?.trim();
	const cursoNombre = fd.get("cursoNombre")?.trim();
	if (!titulo || !fecha || !destino || !responsableNombre || !cursoNombre) return fail(400, { error: "Completá todos los campos obligatorios" });
	const cantRaw = parseInt(fd.get("cantidadAlumnos"), 10);
	let id;
	try {
		({id} = await crearSalida(locals.usuario.usuarioId, {
			titulo,
			fecha,
			destino,
			descripcion: fd.get("descripcion")?.trim() || void 0,
			responsableNombre,
			cursoNombre,
			cantidadAlumnos: isNaN(cantRaw) ? void 0 : cantRaw,
			costoEstimado: fd.get("costoEstimado")?.trim() || void 0,
			notas: fd.get("notas")?.trim() || void 0
		}));
	} catch (e) {
		console.error("[salidas] Error al crear:", e);
		return fail(500, { error: "Error al guardar la salida" });
	}
	throw redirect(303, `/institucional/salidas/${id}`);
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 26;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-m7OV90Vy.js')).default;
const server_id = "src/routes/institucional/salidas/nueva/+page.server.ts";
const imports = ["_app/immutable/nodes/26.Cgv_BxaJ.js","_app/immutable/chunks/85pPpyzY.js","_app/immutable/chunks/BaKrtv6m.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=26-DDII5yi_.js.map
