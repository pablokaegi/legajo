import { redirect, fail } from '@sveltejs/kit';
import { listarCursos } from '$lib/server/services/cursos.js';
import { crearSesion } from '$lib/server/services/agrupamientos.js';
import { exigirStaff } from '$lib/server/agrupamientos/acceso.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  await exigirStaff(locals.usuario);
  const cursos = await listarCursos().catch(() => []);
  return { cursos };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const usuarioId = await exigirStaff(locals.usuario);

    const fd = await request.formData();
    const cursoMoodleId = parseInt(fd.get('cursoMoodleId')?.toString() ?? '0', 10);
    const cursoNombre = (fd.get('cursoNombre') as string)?.trim();
    const titulo = (fd.get('titulo') as string)?.trim();
    const fecha = (fd.get('fecha') as string)?.trim();
    const notas = (fd.get('notas') as string)?.trim() || undefined;
    const cantRaw = parseInt(fd.get('cantidadEvaluar')?.toString() ?? '3', 10);
    const cantidadEvaluar = isNaN(cantRaw) ? 3 : Math.max(1, Math.min(5, cantRaw));
    const permiteBloqueo = fd.get('permiteBloqueo') === '1';

    if (!cursoMoodleId || !cursoNombre)
      return fail(400, { error: 'Seleccioná un curso.' });
    if (!titulo || !fecha)
      return fail(400, { error: 'Completá el título y la fecha.' });

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
