import { p as private_env } from './shared-server-asDUS7ug.js';
import { o as obtenerAutorizacionPorToken, m as marcarAutorizacionSubida } from './salidas-ZJcqeSOl.js';
import { fail, error } from '@sveltejs/kit';
import { join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import './db-jloi_eIm.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'drizzle-orm';
import 'node:crypto';

//#region src/routes/autorizar/[token]/+page.server.ts
var load = async ({ params }) => {
	const aut = await obtenerAutorizacionPorToken(params.token);
	if (!aut) error(404, "El enlace no es válido o ya no está disponible.");
	return { aut };
};
var actions = { subir: async ({ request, params }) => {
	const aut = await obtenerAutorizacionPorToken(params.token);
	if (!aut) return fail(404, { error: "Enlace inválido." });
	if (aut.documentoPath) return fail(400, { error: "Ya existe un documento subido para esta autorización." });
	const archivo = (await request.formData()).get("archivo");
	if (!archivo || archivo.size === 0) return fail(400, { error: "Seleccioná un archivo para subir." });
	if (archivo.size > 10 * 1024 * 1024) return fail(400, { error: "El archivo no puede superar los 10 MB." });
	const ext = archivo.name.split(".").pop()?.toLowerCase() ?? "bin";
	if (![
		"pdf",
		"jpg",
		"jpeg",
		"png",
		"webp"
	].includes(ext)) return fail(400, { error: "Solo se permiten archivos PDF, JPG o PNG." });
	const autDir = join(private_env.UPLOAD_DIR ?? "./uploads", "salidas", params.token);
	mkdirSync(autDir, { recursive: true });
	const nombreArchivo = `autorizacion.${ext}`;
	writeFileSync(join(autDir, nombreArchivo), Buffer.from(await archivo.arrayBuffer()));
	const documentoPath = `salidas/${params.token}/${nombreArchivo}`;
	await marcarAutorizacionSubida(aut.id, documentoPath, archivo.name);
	return { ok: true };
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 7;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-D20DImkD.js')).default;
const server_id = "src/routes/autorizar/[token]/+page.server.ts";
const imports = ["_app/immutable/nodes/7.CV92Q0GZ.js","_app/immutable/chunks/uSN3y40e.js","_app/immutable/chunks/B8WnZMYa.js","_app/immutable/chunks/Du-aiIqU.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=7-qmTJD-vG.js.map
