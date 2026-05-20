import { error, fail } from '@sveltejs/kit';
import {
  obtenerAutorizacionPorToken,
  marcarAutorizacionSubida
} from '$lib/server/services/salidas.js';
import type { PageServerLoad, Actions } from './$types';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '$env/dynamic/private';

// NO auth required — public page
export const load: PageServerLoad = async ({ params }) => {
  const aut = await obtenerAutorizacionPorToken(params.token);
  if (!aut) error(404, 'El enlace no es válido o ya no está disponible.');
  return { aut };
};

export const actions: Actions = {
  subir: async ({ request, params }) => {
    const aut = await obtenerAutorizacionPorToken(params.token);
    if (!aut) return fail(404, { error: 'Enlace inválido.' });
    if (aut.documentoPath) return fail(400, { error: 'Ya existe un documento subido para esta autorización.' });

    const fd = await request.formData();
    const archivo = fd.get('archivo') as File | null;

    if (!archivo || archivo.size === 0)
      return fail(400, { error: 'Seleccioná un archivo para subir.' });
    if (archivo.size > 10 * 1024 * 1024)
      return fail(400, { error: 'El archivo no puede superar los 10 MB.' });

    const ext = archivo.name.split('.').pop()?.toLowerCase() ?? 'bin';
    const permitidos = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
    if (!permitidos.includes(ext))
      return fail(400, { error: 'Solo se permiten archivos PDF, JPG o PNG.' });

    const uploadDir   = env.UPLOAD_DIR ?? './uploads';
    const autDir      = join(uploadDir, 'salidas', params.token);
    mkdirSync(autDir, { recursive: true });

    const nombreArchivo = `autorizacion.${ext}`;
    const rutaCompleta  = join(autDir, nombreArchivo);
    writeFileSync(rutaCompleta, Buffer.from(await archivo.arrayBuffer()));

    const documentoPath = `salidas/${params.token}/${nombreArchivo}`;

    await marcarAutorizacionSubida(aut.id, documentoPath, archivo.name);

    return { ok: true };
  }
};
