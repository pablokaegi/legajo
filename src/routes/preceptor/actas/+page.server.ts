import { redirect } from '@sveltejs/kit';
import { listarActasConAlumnos } from '$lib/server/services/actas.js';
import { esDirectivoOAdmin } from '$lib/server/services/authz.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const estado = url.searchParams.get('estado') ?? undefined;
  const verTodas = await esDirectivoOAdmin(locals.usuario.usuarioId);
  const lista = await listarActasConAlumnos({ page, estado, usuarioId: locals.usuario.usuarioId, verTodas });
  return { lista, page, estado: estado ?? null };
};
