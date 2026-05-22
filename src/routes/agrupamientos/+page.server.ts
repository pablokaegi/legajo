import { redirect } from '@sveltejs/kit';
import { listarSesiones } from '$lib/server/services/agrupamientos.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const estado = url.searchParams.get('estado') ?? undefined;
  const lista = await listarSesiones({ estado });
  return { lista, estado: estado ?? '' };
};
