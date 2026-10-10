import { listarCasos } from '$lib/server/services/gabinete.js';
import { exigirGabinete } from '$lib/server/gabinete/acceso.js';
import { ESTADOS_CASO, ESTADO_IDS } from '$lib/server/gabinete/guia.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  await exigirGabinete(locals.usuario);
  const estadoRaw = url.searchParams.get('estado') ?? 'abiertos';
  const estado = estadoRaw === 'todos' ? undefined : estadoRaw === 'abiertos' || ESTADO_IDS.includes(estadoRaw) ? estadoRaw : 'abiertos';
  const nivelRaw = Number(url.searchParams.get('nivel'));
  const nivel = [1, 2, 3].includes(nivelRaw) ? nivelRaw : undefined;
  const filas = await listarCasos({ estado, nivel });
  return {
    casos: filas.map((f) => ({ ...f.caso, responsable: f.responsable })),
    estado: estadoRaw,
    nivel: nivel ?? 0,
    estados: ESTADOS_CASO
  };
};
