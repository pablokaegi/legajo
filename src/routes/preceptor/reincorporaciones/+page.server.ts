import { error, redirect } from '@sveltejs/kit';
import { listarReincorporaciones } from '$lib/server/services/reincorporaciones.js';
import { alcancePreceptoria } from '$lib/server/services/authz.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  if (await alcancePreceptoria(locals.usuario.usuarioId) !== null) error(403, 'Este registro requiere acceso institucional.');
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const lista = await listarReincorporaciones({ page });
  return { lista, page };
};
