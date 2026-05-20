import { redirect } from '@sveltejs/kit';
import { listarActasConAlumnos } from '$lib/server/services/actas.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const estado = url.searchParams.get('estado') ?? undefined;
  const lista = await listarActasConAlumnos({ page, estado });
  return { lista, page, estado: estado ?? null };
};
