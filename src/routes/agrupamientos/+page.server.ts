import { listarSesiones } from '$lib/server/services/agrupamientos.js';
import { alcancesAgrupamientos } from '$lib/server/services/authz.js';
import { exigirStaff } from '$lib/server/agrupamientos/acceso.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const usuarioId = await exigirStaff(locals.usuario);
  const estado = url.searchParams.get('estado') ?? undefined;
  const alcances = await alcancesAgrupamientos(usuarioId);
  const lista = (await listarSesiones({ estado, usuarioId, ...alcances }))
    .map(({ id, titulo, cursoNombre, estado, fecha, cantidadVotos }) => ({
      id, titulo, cursoNombre, estado, fecha, cantidadVotos
    }));
  return { lista, estado: estado ?? '' };
};
