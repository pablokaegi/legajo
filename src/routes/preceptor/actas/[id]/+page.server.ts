import { redirect, error } from '@sveltejs/kit';
import { obtenerActaCompleta, usuarioPuedeVerActa } from '$lib/server/services/actas.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  const id = parseInt(params.id, 10);
  if (isNaN(id)) error(400, 'ID inválido');

  const acta = await obtenerActaCompleta(id);
  if (!acta) error(404, 'Acta no encontrada');

  // Directivos/admin ven todas; el resto solo las propias o donde son asistentes.
  if (!(await usuarioPuedeVerActa(locals.usuario.usuarioId, acta))) {
    error(404, 'Acta no encontrada');
  }

  return { acta };
};
