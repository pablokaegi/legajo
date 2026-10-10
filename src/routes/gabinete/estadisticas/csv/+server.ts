import { exigirGabinete } from '$lib/server/gabinete/acceso.js';
import {
  estadisticasGabinete,
  estadisticasACsv,
  normalizarPeriodo
} from '$lib/server/services/gabineteEstadisticas.js';
import { registrarAccion } from '$lib/server/services/audit.js';
import type { RequestHandler } from './$types';

// Solo datos agregados (sin nombres de alumnos).
export const GET: RequestHandler = async ({ locals, url }) => {
  const usuarioId = await exigirGabinete(locals.usuario);
  const periodo = normalizarPeriodo(url.searchParams.get('desde'), url.searchParams.get('hasta'));
  const csv = estadisticasACsv(await estadisticasGabinete(periodo));
  await registrarAccion({ usuarioId, accion: 'gabinete.estadisticas.csv', payload: periodo });
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="gabinete_${periodo.desde}_${periodo.hasta}.csv"`,
      'Cache-Control': 'no-store'
    }
  });
};
