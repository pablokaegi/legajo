import { redirect, fail } from '@sveltejs/kit';
import { listarCursos } from '$lib/server/services/cursos.js';
import { crearSesion } from '$lib/server/services/agrupamientos.js';
import { exigirStaff } from '$lib/server/agrupamientos/acceso.js';
import { cursosVisiblesPara, puedeVerCurso } from '$lib/server/services/authz.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const usuarioId = await exigirStaff(locals.usuario);
  const cursos = await cursosVisiblesPara(usuarioId, await listarCursos().catch(() => []));
  return { cursos };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const usuarioId = await exigirStaff(locals.usuario);

    const fd = await request.formData();
    const cursoMoodleId = Number(fd.get('cursoMoodleId'));
    const titulo = (fd.get('titulo') as string)?.trim();
    const fecha = (fd.get('fecha') as string)?.trim();
    const notas = (fd.get('notas') as string)?.trim() || undefined;
    const cantRaw = parseInt(fd.get('cantidadEvaluar')?.toString() ?? '3', 10);
    const cantidadEvaluar = isNaN(cantRaw) ? 3 : Math.max(1, Math.min(5, cantRaw));
    const permiteBloqueo = fd.get('permiteBloqueo') === '1';

    if (!Number.isSafeInteger(cursoMoodleId) || cursoMoodleId <= 0)
      return fail(400, { error: 'Seleccioná un curso.' });
    if (!titulo || !fecha)
      return fail(400, { error: 'Completá el título y la fecha.' });
    if (!(await puedeVerCurso(usuarioId, cursoMoodleId)))
      return fail(403, { error: 'No tenés acceso a este curso.' });
    const cursos = await listarCursos().catch(() => null);
    if (cursos === null) return fail(503, { error: 'No se pudo consultar los cursos en Moodle.' });
    const curso = cursos.find((c) => c.id === cursoMoodleId);
    if (!curso) return fail(400, { error: 'El curso no está disponible en Moodle.' });
    const cursoNombre = (curso.displayname || curso.fullname).slice(0, 200);

    let id: number;
    try {
      id = await crearSesion(usuarioId, {
        cursoMoodleId,
        cursoNombre,
        titulo,
        fecha,
        cantidadEvaluar,
        permiteBloqueo,
        notas
      });
    } catch (err) {
      return fail(500, { error: err instanceof Error ? err.message : 'Error al guardar' });
    }

    throw redirect(303, `/agrupamientos/${id}`);
  }
};
