import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Toda la sección /admin es exclusiva del rol "admin".
export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  if (!locals.usuario.roles.includes('admin')) {
    throw error(403, 'Esta sección es solo para administradores del sistema.');
  }
  return {};
};
