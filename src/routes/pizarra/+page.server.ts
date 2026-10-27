import { listarCursos } from '$lib/server/services/cursos.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const cursos = (await listarCursos().catch(() => []))
    .map((c) => ({ id: c.id, nombre: c.displayname || c.fullname }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  return { cursos };
};
