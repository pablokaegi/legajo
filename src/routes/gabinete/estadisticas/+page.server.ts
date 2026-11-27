import { exigirGabinete } from '$lib/server/gabinete/acceso.js';
import { estadisticasGabinete, normalizarPeriodo } from '$lib/server/services/gabineteEstadisticas.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  await exigirGabinete(locals.usuario);
  const periodo = normalizarPeriodo(url.searchParams.get('desde'), url.searchParams.get('hasta'));
  return { e: await estadisticasGabinete(periodo) };
};
