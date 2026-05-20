import { redirect, fail } from '@sveltejs/kit';
import { crearSalida } from '$lib/server/services/salidas.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const fd = await request.formData();

    const titulo            = (fd.get('titulo') as string)?.trim();
    const fecha             = (fd.get('fecha') as string)?.trim();
    const destino           = (fd.get('destino') as string)?.trim();
    const responsableNombre = (fd.get('responsableNombre') as string)?.trim();
    const cursoNombre       = (fd.get('cursoNombre') as string)?.trim();

    if (!titulo || !fecha || !destino || !responsableNombre || !cursoNombre) {
      return fail(400, { error: 'Completá todos los campos obligatorios' });
    }

    const cantRaw = parseInt(fd.get('cantidadAlumnos') as string, 10);

    let id: number;
    try {
      ({ id } = await crearSalida(locals.usuario.usuarioId, {
        titulo,
        fecha,
        destino,
        descripcion:        (fd.get('descripcion') as string)?.trim() || undefined,
        responsableNombre,
        cursoNombre,
        cantidadAlumnos:    isNaN(cantRaw) ? undefined : cantRaw,
        costoEstimado:      (fd.get('costoEstimado') as string)?.trim() || undefined,
        notas:              (fd.get('notas') as string)?.trim() || undefined
      }));
    } catch (e) {
      console.error('[salidas] Error al crear:', e);
      return fail(500, { error: 'Error al guardar la salida' });
    }
    throw redirect(303, `/institucional/salidas/${id}`);
  }
};
