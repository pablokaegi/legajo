import { fail } from '@sveltejs/kit';
import {
  idsQueVotaron,
  asignarCompaneros,
  procesarVotoDesdeForm,
  modoDe
} from '$lib/server/services/agrupamientos.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { exigirSesion } from '$lib/server/agrupamientos/acceso.js';
import type { AlumnoRef } from '$lib/server/agrupamientos/tipos.js';
import type { PageServerLoad, Actions } from './$types';

async function rosterDe(cursoMoodleId: number): Promise<AlumnoRef[]> {
  return (await listarAlumnosDeCurso(cursoMoodleId).catch(() => []))
    .map((u) => ({ id: u.id, nombre: u.fullname }));
}

export const load: PageServerLoad = async ({ locals, params }) => {
  const { sesion } = await exigirSesion(locals.usuario, params.id, 'gestionar');
  const roster = await rosterDe(sesion.cursoMoodleId);
  const modo = modoDe(sesion);

  const yaVotaron = [...(await idsQueVotaron(sesion.id))];

  // Solo el formato anterior asigna compañeros; en nominación se elige de toda la lista.
  const asignaciones: Record<number, AlumnoRef[]> = {};
  if (modo === 'calificacion') {
    for (const a of roster) {
      asignaciones[a.id] = asignarCompaneros(sesion.id, a.id, roster, sesion.cantidadEvaluar);
    }
  }

  return { sesion, roster, yaVotaron, asignaciones, modo };
};

export const actions: Actions = {
  votar: async ({ request, locals, params }) => {
    const { sesion } = await exigirSesion(locals.usuario, params.id, 'gestionar');
    if (sesion.estado === 'cerrada') return fail(400, { error: 'La votación está cerrada.' });

    const roster = await rosterDe(sesion.cursoMoodleId);
    if (roster.length === 0) return fail(503, { error: 'No se pudo obtener la lista del curso.' });

    const res = await procesarVotoDesdeForm(sesion.id, await request.formData(), {
      roster,
      cantidadEvaluar: sesion.cantidadEvaluar,
      modo: modoDe(sesion),
      permiteBloqueo: sesion.permiteBloqueo
    });
    if ('error' in res) return fail(400, res);
    return { ok: true };
  }
};
