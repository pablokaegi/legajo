import { redirect } from '@sveltejs/kit';
import { listarAmonestaciones } from '$lib/server/services/amonestaciones.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const gravedad = url.searchParams.get('gravedad') ?? undefined;
  const lista = await listarAmonestaciones({ page, gravedad });
  return { lista, page, gravedad: gravedad ?? null };
};
