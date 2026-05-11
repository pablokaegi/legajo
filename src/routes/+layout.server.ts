import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const isAuthRoute = url.pathname.startsWith('/auth');
  const isApiRoute = url.pathname.startsWith('/api');

  // Las rutas de API no necesitan redirect, manejan su propia auth
  if (isApiRoute) {
    return { docente: locals.docente };
  }

  // Redirigir a login si no hay sesión
  if (!locals.docente && !isAuthRoute) {
    redirect(303, `/auth?redirect=${encodeURIComponent(url.pathname)}`);
  }

  // Redirigir al dashboard si ya está logueado y va a /auth
  if (locals.docente && isAuthRoute) {
    redirect(303, '/');
  }

  return { docente: locals.docente };
};
