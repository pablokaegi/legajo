import { o as obtenerAutorizacionPorToken, m as marcarAutorizacionSubida } from './salidas-CkIitNEO.js';
import { p as private_env } from './index.js-D6_LEqEo.js';
import { fail, error } from '@sveltejs/kit';
import { join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import './db-D7hI4G6x.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'drizzle-orm';
import 'node:crypto';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';

// src/routes/autorizar/[token]/+page.server.ts
var load = async ({ params }) => {
	const aut = await obtenerAutorizacionPorToken(params.token);
	if (!aut) error(404, "El enlace no es válido o ya no está disponible.");
	return { aut };
};
var actions = { subir: async ({ request, params }) => {
	const aut = await obtenerAutorizacionPorToken(params.token);
	if (!aut) return fail(404, { error: "Enlace inválido." });
	if (aut.documentoPath) return fail(400, { error: "Ya existe un documento subido para esta autorización." });
	let fd;
	try {
		fd = await request.formData();
	} catch (err) {
		console.error("[autorizar] Error leyendo formData:", err);
		return fail(413, { error: "El archivo es demasiado pesado. Intentá con una foto más liviana (máx. 10 MB)." });
	}
	const archivo = fd.get("archivo");
	if (!archivo || archivo.size === 0) return fail(400, { error: "Seleccioná un archivo para subir." });
	if (archivo.size > 10485760) return fail(400, { error: "El archivo no puede superar los 10 MB." });
	const ext = archivo.name.split(".").pop()?.toLowerCase() ?? "bin";
	if (![
		"pdf",
		"jpg",
		"jpeg",
		"png",
		"webp"
	].includes(ext)) return fail(400, { error: "Solo se permiten archivos PDF, JPG o PNG." });
	const uploadDir = private_env.UPLOAD_DIR ?? "./uploads";
	const autDir = join(uploadDir, "salidas", params.token);
	const nombreArchivo = `autorizacion.${ext}`;
	const rutaCompleta = join(autDir, nombreArchivo);
	let buffer;
	try {
		buffer = Buffer.from(await archivo.arrayBuffer());
	} catch {
		return fail(500, { error: "No se pudo leer el archivo. Intentá de nuevo." });
	}
	try {
		mkdirSync(autDir, { recursive: true });
		writeFileSync(rutaCompleta, buffer);
	} catch (err) {
		console.error("[autorizar] Error al guardar archivo:", err);
		return fail(500, { error: "Error al guardar el archivo en el servidor. Contactá al establecimiento." });
	}
	const documentoPath = `salidas/${params.token}/${nombreArchivo}`;
	try {
		await marcarAutorizacionSubida(aut.id, documentoPath, archivo.name);
	} catch (err) {
		console.error("[autorizar] Error al actualizar BD:", err);
		return fail(500, { error: "El archivo se guardó pero no se pudo registrar. Contactá al establecimiento." });
	}
	return { ok: true };
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 22;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CgtAKRNu.js')).default;
const server_id = "src/routes/autorizar/[token]/+page.server.ts";
const imports = ["_app/immutable/nodes/22.ClAX9I3t.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js","_app/immutable/chunks/BED2mB-Q.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=22-8reEH9RE.js.map
