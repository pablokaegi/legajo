import { listarCursos } from '$lib/server/services/cursos.js';
import { resumenTablero, listarCasos } from '$lib/server/services/gabinete.js';
import { exigirGabinete } from '$lib/server/gabinete/acceso.js';
import { ESTADOS_CASO } from '$lib/server/gabinete/guia.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  await exigirGabinete(locals.usuario);
  const [resumen, derivados, cursos] = await Promise.all([
    resumenTablero(),
    listarCasos({ estado: 'derivado' }),
    listarCursos().catch(() => [])
  ]);
  return {
    resumen,
    derivados: derivados.map((d) => ({ ...d.caso, responsable: d.responsable })),
    cursos: cursos.map((c) => ({ id: c.id, nombre: c.displayname || c.fullname })),
    estados: ESTADOS_CASO
  };
};
