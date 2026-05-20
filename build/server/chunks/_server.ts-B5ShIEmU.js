import { b as private_env } from './shared-server-9-2j12mp.js';
import { o as obtenerSalidaPorToken } from './salidas-Be1z8cLp.js';
import { error } from '@sveltejs/kit';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import './db-Dxq-FYMn.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'drizzle-orm';
import 'node:crypto';

//#region src/routes/autorizar/[token]/archivo/+server.ts
var GET = async ({ params }) => {
	const salida = await obtenerSalidaPorToken(params.token);
	if (!salida || !salida.documentoPath) error(404, "Archivo no encontrado.");
	const rutaCompleta = join(private_env.UPLOAD_DIR ?? "./uploads", salida.documentoPath);
	if (!existsSync(rutaCompleta)) error(404, "Archivo no disponible.");
	const buffer = readFileSync(rutaCompleta);
	const ext = salida.documentoPath.split(".").pop()?.toLowerCase() ?? "bin";
	const contentType = {
		pdf: "application/pdf",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		webp: "image/webp"
	}[ext] ?? "application/octet-stream";
	const filename = encodeURIComponent(salida.documentoNombre ?? `autorizacion.${ext}`);
	return new Response(buffer, { headers: {
		"Content-Type": contentType,
		"Content-Disposition": `inline; filename="${filename}"`,
		"Cache-Control": "private, no-cache"
	} });
};

export { GET };
//# sourceMappingURL=_server.ts-B5ShIEmU.js.map
