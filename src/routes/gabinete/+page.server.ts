import { listarCursos } from '$lib/server/services/cursos.js';
import { resumenTablero, listarCasos } from '$lib/server/services/gabinete.js';
import { exigirGabinete } from '$lib/server/gabinete/acceso.js';
import { destinoCuestionarioCiencias } from '$lib/server/services/aulaPiloto.js';
import { puedeVerEvidenciasDeGabinete } from '$lib/server/services/authz.js';
import { ESTADOS_CASO } from '$lib/server/gabinete/guia.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const usuarioId = await exigirGabinete(locals.usuario);
  const destino = destinoCuestionarioCiencias();
  const [resumen, derivados, cursos, verObjetivos] = await Promise.all([
    resumenTablero(),
    listarCasos({ estado: 'derivado' }),
    listarCursos().catch(() => []),
    destino ? puedeVerEvidenciasDeGabinete(usuarioId, destino.cursoId) : false
  ]);
  return {
    resumen, verObjetivos,
    derivados: derivados.map((d) => ({ ...d.caso, responsable: d.responsable })),
    cursos: cursos.map((c) => ({ id: c.id, nombre: c.displayname || c.fullname })),
    estados: ESTADOS_CASO
  };
};
