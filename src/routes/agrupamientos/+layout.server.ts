import { exigirStaff } from '$lib/server/agrupamientos/acceso.js';
import type { LayoutServerLoad } from './$types';

// Los sociogramas son datos sensibles de menores: solo equipo docente.
// (Las actions no pasan por acá; cada una vuelve a verificar.)
export const load: LayoutServerLoad = async ({ locals }) => {
  await exigirStaff(locals.usuario);
  return {};
};
