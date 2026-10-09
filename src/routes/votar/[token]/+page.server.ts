import { error, fail } from '@sveltejs/kit';
import {
  obtenerSesionPorToken,
  idsQueVotaron,
  asignarCompaneros,
  procesarVotoDesdeForm,
  modoDe
} from '$lib/server/services/agrupamientos.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import type { AlumnoRef } from '$lib/server/agrupamientos/tipos.js';
import type { PageServerLoad, Actions } from './$types';

async function rosterDe(cursoMoodleId: number): Promise<AlumnoRef[]> {
  return (await listarAlumnosDeCurso(cursoMoodleId).catch(() => []))
    .map((u) => ({ id: u.id, nombre: u.fullname }));
}

// Página pública — sin autenticación. Para que los alumnos voten desde el celular.
export const load: PageServerLoad = async ({ params }) => {
  const sesion = await obtenerSesionPorToken(params.token);
  if (!sesion) error(404, 'El enlace de votación no es válido o ya no está disponible.');

  const roster = await rosterDe(sesion.cursoMoodleId);
  const modo = modoDe(sesion);
  const yaVotaron = [...(await idsQueVotaron(sesion.id))];

  const asignaciones: Record<number, AlumnoRef[]> = {};
  if (modo === 'calificacion') {
    for (const a of roster) {
      asignaciones[a.id] = asignarCompaneros(sesion.id, a.id, roster, sesion.cantidadEvaluar);
    }
  }

  // Página pública: solo lo que el kiosko muestra (nada de notas del docente ni ids internos).
  const publica = {
    titulo: sesion.titulo,
    cursoNombre: sesion.cursoNombre,
    estado: sesion.estado,
    cantidadEvaluar: sesion.cantidadEvaluar,
    permiteBloqueo: sesion.permiteBloqueo
  };
  return { sesion: publica, roster, yaVotaron, asignaciones, modo };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const sesion = await obtenerSesionPorToken(params.token);
    if (!sesion) return fail(404, { error: 'Enlace inválido.' });
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
