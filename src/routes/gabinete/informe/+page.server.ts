import { exigirGabinete } from '$lib/server/gabinete/acceso.js';
import { estadisticasGabinete, normalizarPeriodo } from '$lib/server/services/gabineteEstadisticas.js';
import { registrarAccion } from '$lib/server/services/audit.js';
import type { PageServerLoad } from './$types';

// Informe institucional del período para dirección: solo datos agregados.
export const load: PageServerLoad = async ({ locals, url }) => {
  const usuarioId = await exigirGabinete(locals.usuario);
  const periodo = normalizarPeriodo(url.searchParams.get('desde'), url.searchParams.get('hasta'));
  await registrarAccion({ usuarioId, accion: 'gabinete.informe.institucional', payload: periodo });
  return { e: await estadisticasGabinete(periodo), emisor: locals.usuario!.nombre };
};
