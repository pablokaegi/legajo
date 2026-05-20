import { redirect, fail } from '@sveltejs/kit';
import { crearEfemeride } from '$lib/server/services/efemerides.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const fd = await request.formData();

    const titulo = (fd.get('titulo') as string)?.trim();
    const fecha  = (fd.get('fecha') as string)?.trim();
    if (!titulo || !fecha) return fail(400, { error: 'Título y fecha son requeridos' });

    // Cursos responsables: textarea con uno por línea → JSON
    const cursosRaw = (fd.get('cursosResponsables') as string)?.trim() ?? '';
    const cursosArr = cursosRaw
      .split('\n').map(s => s.trim()).filter(Boolean)
      .map(s => ({ cursoNombre: s }));
    const cursosJson = cursosArr.length > 0 ? JSON.stringify(cursosArr) : null;

    try {
      const id = await crearEfemeride(locals.usuario.usuarioId, {
        titulo,
        fecha,
        descripcion:        (fd.get('descripcion') as string)?.trim() || undefined,
        cursosResponsables: cursosJson ?? undefined,
        docenteResponsable: (fd.get('docenteResponsable') as string)?.trim() || undefined,
        estado:             (fd.get('estado') as string) || 'planificado',
        notas:              (fd.get('notas') as string)?.trim() || undefined
      });
      throw redirect(303, `/institucional/efemerides/${id}`);
    } catch (e) {
      if (e instanceof Response) throw e;
      return fail(500, { error: 'Error al guardar la efeméride' });
    }
  }
};
