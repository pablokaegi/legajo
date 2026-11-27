// Guardas de acceso para las rutas de Agrupamientos.
// Las acciones de formulario NO ejecutan los load del layout: cada load y cada
// action tiene que pasar por acá.

import { redirect, error } from '@sveltejs/kit';
import { esStaff } from '../services/authz.js';
import {
  obtenerSesion,
  puedeVerSesion,
  puedeGestionarSesion
} from '../services/agrupamientos.js';

export async function exigirStaff(usuario: App.Locals['usuario']): Promise<number> {
  if (!usuario) throw redirect(303, '/auth');
  if (!(await esStaff(usuario.usuarioId)))
    error(403, 'Agrupamientos es una herramienta del equipo docente.');
  return usuario.usuarioId;
}

/**
 * Carga la sesión del parámetro de ruta y verifica el permiso pedido:
 * - 'ver': quien la creó, o preceptoría/dirección/admin.
 * - 'gestionar': quien la creó, o dirección/admin.
 */
export async function exigirSesion(
  usuario: App.Locals['usuario'],
  idParam: string,
  nivel: 'ver' | 'gestionar'
) {
  const usuarioId = await exigirStaff(usuario);
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) error(400, 'ID inválido');

  const sesion = await obtenerSesion(id);
  if (!sesion) error(404, 'Sesión no encontrada');

  const ok =
    nivel === 'ver'
      ? await puedeVerSesion(usuarioId, sesion)
      : await puedeGestionarSesion(usuarioId, sesion);
  if (!ok) error(403, 'No tenés acceso a esta sesión.');

  return { sesion, usuarioId };
}
