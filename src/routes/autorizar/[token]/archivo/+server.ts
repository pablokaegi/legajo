import { error } from '@sveltejs/kit';
import { obtenerSalidaPorToken } from '$lib/server/services/salidas.js';
import type { RequestHandler } from './$types';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ params }) => {
  const salida = await obtenerSalidaPorToken(params.token);
  if (!salida || !salida.documentoPath) error(404, 'Archivo no encontrado.');

  const uploadDir = env.UPLOAD_DIR ?? './uploads';
  const rutaCompleta = join(uploadDir, salida.documentoPath);

  if (!existsSync(rutaCompleta)) error(404, 'Archivo no disponible.');

  const buffer = readFileSync(rutaCompleta);
  const ext = salida.documentoPath.split('.').pop()?.toLowerCase() ?? 'bin';

  const mimeTypes: Record<string, string> = {
    pdf:  'application/pdf',
    jpg:  'image/jpeg',
    jpeg: 'image/jpeg',
    png:  'image/png',
    webp: 'image/webp'
  };
  const contentType = mimeTypes[ext] ?? 'application/octet-stream';
  const filename = encodeURIComponent(salida.documentoNombre ?? `autorizacion.${ext}`);

  return new Response(buffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'private, no-cache'
    }
  });
};
