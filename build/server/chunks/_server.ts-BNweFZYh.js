import { o as obtenerAutorizacionPorToken } from './salidas-CkIitNEO.js';
import { p as private_env } from './index.js-D6_LEqEo.js';
import { error } from '@sveltejs/kit';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import './db-D7hI4G6x.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'drizzle-orm';
import 'node:crypto';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';

// src/routes/autorizar/[token]/archivo/+server.ts
var GET = async ({ params }) => {
	const aut = await obtenerAutorizacionPorToken(params.token);
	if (!aut || !aut.documentoPath) error(404, "Archivo no encontrado.");
	const uploadDir = private_env.UPLOAD_DIR ?? "./uploads";
	const rutaCompleta = join(uploadDir, aut.documentoPath);
	if (!existsSync(rutaCompleta)) error(404, "Archivo no disponible.");
	const buffer = readFileSync(rutaCompleta);
	const ext = aut.documentoPath.split(".").pop()?.toLowerCase() ?? "bin";
	const contentType = {
		pdf: "application/pdf",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		webp: "image/webp"
	}[ext] ?? "application/octet-stream";
	const filename = encodeURIComponent(aut.documentoNombre ?? `autorizacion_${aut.alumnoNombre}.${ext}`);
	return new Response(buffer, { headers: {
		"Content-Type": contentType,
		"Content-Disposition": `inline; filename="${filename}"`,
		"Cache-Control": "private, no-cache"
	} });
};

export { GET };
//# sourceMappingURL=_server.ts-BNweFZYh.js.map
