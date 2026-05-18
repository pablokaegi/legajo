import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const isAuthRoute = url.pathname.startsWith('/auth');
  const isApiRoute = url.pathname.startsWith('/api');

  if (isApiRoute) {
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
