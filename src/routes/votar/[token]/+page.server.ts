import { error, fail } from '@sveltejs/kit';
import {
  obtenerSesionPorToken,
  idsQueVotaron,
  asignarCompaneros,
  procesarVotoDesdeForm
} from '$lib/server/services/agrupamientos.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import type { AlumnoRef } from '$lib/server/agrupamientos/tipos.js';
import type { PageServerLoad, Actions } from './$types';

// Página pública — sin autenticación. Para que los alumnos voten desde el celular.
export const load: PageServerLoad = async ({ params }) => {
  const sesion = await obtenerSesionPorToken(params.token);
  if (!sesion) error(404, 'El enlace de votación no es válido o ya no está disponible.');

  const roster: AlumnoRef[] = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => []))
    .map((u) => ({ id: u.id, nombre: u.fullname }));

  const yaVotaron = [...(await idsQueVotaron(sesion.id))];

  const asignaciones: Record<number, AlumnoRef[]> = {};
  for (const a of roster) {
    asignaciones[a.id] = asignarCompaneros(sesion.id, a.id, roster, sesion.cantidadEvaluar);
  }

  return { sesion, roster, yaVotaron, asignaciones };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const sesion = await obtenerSesionPorToken(params.token);
    if (!sesion) return fail(404, { error: 'Enlace inválido.' });
    if (sesion.estado === 'cerrada') return fail(400, { error: 'La votación está cerrada.' });

    const res = await procesarVotoDesdeForm(sesion.id, await request.formData());
    if ('error' in res) return fail(400, res);
    return { ok: true };
  }
};
