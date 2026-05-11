import { obtenerHistorialFiltrado } from '$lib/server/services/observaciones.js';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ url, locals }) => {
  const alumno = url.searchParams.get('alumno')?.trim() || undefined;
  const curso = url.searchParams.get('curso')?.trim() || undefined;
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
  const guardado = url.searchParams.get('guardado') === '1';

  const { observaciones, total } = await obtenerHistorialFiltrado({
    docenteId: locals.docente?.docenteId,
    alumno,
    curso,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE
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
