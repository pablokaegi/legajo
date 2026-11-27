import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { exigirGabinete } from '$lib/server/gabinete/acceso.js';
import { leerCuestionarioCiencias } from '$lib/server/moodle/cuestionario-ciencias.js';
import { destinoCuestionarioCiencias } from '$lib/server/services/aulaPiloto.js';
import { puedeVerEvidenciasDeGabinete } from '$lib/server/services/authz.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
  setHeaders({ 'cache-control': 'private, no-store' });
  const usuarioId = await exigirGabinete(locals.usuario);
  const destino = destinoCuestionarioCiencias();
  if (!destino) error(404, 'El cuestionario de Ciencias no está configurado en el piloto.');
  if (!(await puedeVerEvidenciasDeGabinete(usuarioId, destino.cursoId))) {
    error(403, 'El curso de Ciencias está fuera de tu alcance de gabinete.');
  }
  try {
    return await leerCuestionarioCiencias(env, destino.quizId);
  } catch {
    error(503, 'No se pudo consultar el cuestionario o su padrón. Revisá el Moodle de prueba y volvé a intentar.');
  }
};
