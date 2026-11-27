import { exigirGabinete } from '$lib/server/gabinete/acceso.js';
import { GUIA_POR_NIVEL, ESTADOS_CASO, TIPOS_INTERVENCION, DIAS_REVISION } from '$lib/server/gabinete/guia.js';
import { UMBRALES } from '$lib/server/gabinete/alerta.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  await exigirGabinete(locals.usuario);
  return { guia: GUIA_POR_NIVEL, estados: ESTADOS_CASO, tipos: TIPOS_INTERVENCION, dias: DIAS_REVISION, umbrales: UMBRALES };
};
