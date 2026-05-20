import { redirect, fail } from '@sveltejs/kit';
import { crearActa, NuevaActaSchema } from '$lib/server/services/actas.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const { listarCursos } = await import('$lib/server/services/cursos.js');
  const cursos = await listarCursos().catch(() => []);
  return { cursos };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const form = await request.formData();

    const tareasRaw = form.get('tareas')?.toString() ?? '[]';
    let tareas: { descripcion: string; responsableId?: number; dueDate?: string }[] = [];
    try { tareas = JSON.parse(tareasRaw); } catch { /* ignorar */ }

    const asistentesRaw = form.get('asistentes')?.toString() ?? '[]';
    let asistentes: { usuarioId: number; rol?: string }[] = [];
    try { asistentes = JSON.parse(asistentesRaw); } catch { /* ignorar */ }

    const input = {
      fecha: form.get('fecha')?.toString() ?? '',
      titulo: form.get('titulo')?.toString() ?? '',
      resumen: form.get('resumen')?.toString() ?? '',
      acuerdos: form.get('acuerdos')?.toString() || undefined,
      tareas,
      asistentes,
      alumnos: (() => {
        try { return JSON.parse(form.get('alumnos')?.toString() ?? '[]'); } catch { return []; }
      })()
    };

    const parsed = NuevaActaSchema.safeParse(input);
    if (!parsed.success) {
      return fail(422, { error: 'Datos inválidos', details: parsed.error.flatten() });
    }

    let id: number;
    try {
      id = await crearActa(locals.usuario.usuarioId, parsed.data);
      await registrarAccion({
        usuarioId: locals.usuario.usuarioId,
        accion: 'crear_acta',
        tablaDestino: 'actas',
        idDestino: id,
        ip: ipDe(request)
      });
    } catch (err) {
      return fail(500, { error: err instanceof Error ? err.message : 'Error al guardar' });
    }

    throw redirect(303, `/preceptor/actas/${id}`);
  }
};
