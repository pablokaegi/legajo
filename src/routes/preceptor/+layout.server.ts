import { redirect, error } from '@sveltejs/kit';
import { esPreceptorODirectivo } from '$lib/server/services/authz.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, `/auth?redirect=${encodeURIComponent(url.pathname)}`);

  if (!(await esPreceptorODirectivo(locals.usuario.usuarioId))) {
    // Docentes pueden ver, no gestionar
    error(403, 'Esta sección es solo para preceptores y directivos');
  }

  return { usuario: locals.usuario };
};
