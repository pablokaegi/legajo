import { redirect, error } from '@sveltejs/kit';
import { esPreceptorODirectivo } from '$lib/server/services/authz.js';
import type { LayoutServerLoad } from './$types';

// Toda la sección /institucional (efemérides, salidas) es de gestión institucional:
// solo preceptoría, dirección y admin. NO docentes ni familias.
export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, `/auth?redirect=${encodeURIComponent(url.pathname)}`);
  if (!(await esPreceptorODirectivo(locals.usuario.usuarioId)))
    error(403, 'Esta sección es solo para preceptoría y dirección.');
  return {};
};
