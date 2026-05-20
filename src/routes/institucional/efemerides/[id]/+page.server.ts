import { redirect, error, fail } from '@sveltejs/kit';
import { obtenerEfemeride, editarEfemeride, eliminarEfemeride } from '$lib/server/services/efemerides.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const id = parseInt(params.id, 10);
  if (isNaN(id)) error(400, 'ID inválido');
  const ev = await obtenerEfemeride(id);
  if (!ev) error(404, 'Efeméride no encontrada');
  return { ev };
};

export const actions: Actions = {
  editar: async ({ request, locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const id = parseInt(params.id, 10);
    const fd = await request.formData();
    const titulo = (fd.get('titulo') as string)?.trim();
    const fecha  = (fd.get('fecha') as string)?.trim();
    if (!titulo || !fecha) return fail(400, { error: 'Título y fecha requeridos' });

    const cursosRaw = (fd.get('cursosResponsables') as string)?.trim() ?? '';
    const cursosArr = cursosRaw.split('\n').map(s => s.trim()).filter(Boolean).map(s => ({ cursoNombre: s }));
    const cursosJson = cursosArr.length > 0 ? JSON.stringify(cursosArr) : null;

    await editarEfemeride(id, {
      titulo, fecha,
      descripcion:        (fd.get('descripcion') as string)?.trim() || null,
      cursosResponsables: cursosJson,
      docenteResponsable: (fd.get('docenteResponsable') as string)?.trim() || null,
      estado:             (fd.get('estado') as string) || 'planificado',
      notas:              (fd.get('notas') as string)?.trim() || null
    });
    throw redirect(303, `/institucional/efemerides/${id}`);
  },
  eliminar: async ({ locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const id = parseInt(params.id, 10);
    await eliminarEfemeride(id);
    throw redirect(303, '/institucional/efemerides');
  }
};
