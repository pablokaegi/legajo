import { redirect, error } from '@sveltejs/kit';
import {
  obtenerSalida,
  listarAutorizacionesDeSalida
} from '$lib/server/services/salidas.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const id = parseInt(params.id, 10);
  if (isNaN(id)) error(400, 'ID inválido');

  const salida = await obtenerSalida(id);
  if (!salida) error(404, 'Salida no encontrada');

  const todas = await listarAutorizacionesDeSalida(id);
  const recibidas  = todas.filter((a) => a.documentoPath);
  const pendientes = todas.filter((a) => !a.documentoPath);

  return { salida, recibidas, pendientes };
};
