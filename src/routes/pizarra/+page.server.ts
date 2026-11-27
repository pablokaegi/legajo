import { listarCursos } from '$lib/server/services/cursos.js';
import { cursosVisiblesPara } from '$lib/server/services/authz.js';
import { exigirStaff } from '$lib/server/agrupamientos/acceso.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const usuarioId = await exigirStaff(locals.usuario);
  const cursos = (await cursosVisiblesPara(usuarioId, await listarCursos().catch(() => [])))
    .map((c) => ({ id: c.id, nombre: c.displayname || c.fullname }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  return { cursos };
};
