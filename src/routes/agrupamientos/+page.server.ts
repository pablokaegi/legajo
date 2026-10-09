import { listarSesiones } from '$lib/server/services/agrupamientos.js';
import { esPreceptorODirectivo } from '$lib/server/services/authz.js';
import { exigirStaff } from '$lib/server/agrupamientos/acceso.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const usuarioId = await exigirStaff(locals.usuario);
  const estado = url.searchParams.get('estado') ?? undefined;
  // Docentes: solo sus sesiones. Preceptoría/dirección/admin: todas.
  const verTodas = await esPreceptorODirectivo(usuarioId);
  const lista = await listarSesiones({ estado, usuarioId, verTodas });
  return { lista, estado: estado ?? '' };
};
