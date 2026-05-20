import { b as private_env } from './shared-server-9-2j12mp.js';
import { o as obtenerSalidaPorToken, e as editarSalida } from './salidas-Be1z8cLp.js';
import { fail, error } from '@sveltejs/kit';
import { join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import './db-Dxq-FYMn.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'drizzle-orm';
import 'node:crypto';

//#region src/routes/autorizar/[token]/+page.server.ts
var load = async ({ params }) => {
	const salida = await obtenerSalidaPorToken(params.token);
	if (!salida) error(404, "El enlace no es válido o ya no está disponible.");
	return { salida };
};
var actions = { subir: async ({ request, params }) => {
	const salida = await obtenerSalidaPorToken(params.token);
	if (!salida) return fail(404, { error: "Enlace inválido." });
	if (salida.documentoPath) return fail(400, { error: "Ya existe un documento subido para esta salida." });
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
	const salidaDir = join(private_env.UPLOAD_DIR ?? "./uploads", "salidas", params.token);
	mkdirSync(salidaDir, { recursive: true });
	const nombreArchivo = `autorizacion.${ext}`;
	writeFileSync(join(salidaDir, nombreArchivo), Buffer.from(await archivo.arrayBuffer()));
	const documentoPath = `salidas/${params.token}/${nombreArchivo}`;
	await editarSalida(salida.id, {
		documentoPath,
		documentoNombre: archivo.name,
		documentoSubidoAt: /* @__PURE__ */ new Date()
	});
	return { ok: true };
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 7;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B-Is9UqO.js')).default;
const server_id = "src/routes/autorizar/[token]/+page.server.ts";
const imports = ["_app/immutable/nodes/7.Dujk8HdP.js","_app/immutable/chunks/uSN3y40e.js","_app/immutable/chunks/B8WnZMYa.js","_app/immutable/chunks/Du-aiIqU.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=7-D5HfVEFT.js.map
