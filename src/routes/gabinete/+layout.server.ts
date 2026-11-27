import { exigirGabinete } from '$lib/server/gabinete/acceso.js';
import type { LayoutServerLoad } from './$types';

// Información reservada: solo el rol "gabinete" (psicopedagogas) y admin.
export const load: LayoutServerLoad = async ({ locals }) => {
  await exigirGabinete(locals.usuario);
  return {};
};
