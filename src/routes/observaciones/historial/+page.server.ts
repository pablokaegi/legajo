import { redirect } from '@sveltejs/kit';
import { obtenerHistorialFiltrado } from '$lib/server/services/observaciones.js';
import { esDirectivo } from '$lib/server/services/authz.js';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ url, locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  const alumno = url.searchParams.get('alumno')?.trim() || undefined;
  const curso = url.searchParams.get('curso')?.trim() || undefined;
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
  const guardado = url.searchParams.get('guardado') === '1';

  const omitUsuarioFilter = await esDirectivo(locals.usuario.usuarioId);

  const { observaciones, total } = await obtenerHistorialFiltrado({
    usuarioId: locals.usuario.usuarioId,
    alumno,
    curso,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    omitUsuarioFilter
  });

  return {
    observaciones,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    filtros: { alumno: alumno ?? '', curso: curso ?? '' },
    guardado
  };
};
