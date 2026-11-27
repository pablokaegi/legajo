import { redirect } from '@sveltejs/kit';
import { listarSalidas } from '$lib/server/services/salidas.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const page   = parseInt(url.searchParams.get('page') ?? '1', 10);
  const estado = url.searchParams.get('estado') ?? undefined;
  const lista  = await listarSalidas({ page, estado });
  return { lista, page, estado: estado ?? '' };
};
