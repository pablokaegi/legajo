import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const isAuthRoute = url.pathname.startsWith('/auth');
  const isApiRoute = url.pathname.startsWith('/api');
  // Páginas públicas por token (sin cuenta): votación de alumnos desde el
  // celular y subida de autorizaciones de salidas por las familias.
  const isPublicRoute = url.pathname.startsWith('/votar/') || url.pathname.startsWith('/autorizar/');

  if (isApiRoute || isPublicRoute) {
    return { usuario: locals.usuario };
  }

  if (!locals.usuario && !isAuthRoute) {
    redirect(303, `/auth?redirect=${encodeURIComponent(url.pathname)}`);
  }

  if (locals.usuario && isAuthRoute) {
    redirect(303, '/');
  }

  return { usuario: locals.usuario };
};
