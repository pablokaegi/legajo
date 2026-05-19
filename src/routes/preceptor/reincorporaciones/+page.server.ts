import { redirect } from '@sveltejs/kit';
import { listarReincorporaciones } from '$lib/server/services/reincorporaciones.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const lista = await listarReincorporaciones({ page });
  return { lista, page };
};
