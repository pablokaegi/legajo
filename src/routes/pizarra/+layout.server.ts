import { exigirStaff } from '$lib/server/agrupamientos/acceso.js';
import type { LayoutServerLoad } from './$types';

// Modo pizarra: pantalla pública del aula. Solo personal docente, y solo
// datos que puede ver todo el curso (nombres, grupos, plano). Nada sensible.
export const load: LayoutServerLoad = async ({ locals }) => {
  await exigirStaff(locals.usuario);
  return { nombreDocente: locals.usuario!.nombre };
};
