import { redirect, fail } from '@sveltejs/kit';
import { crearReincorporacion, NuevaReincorporacionSchema } from '$lib/server/services/reincorporaciones.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  return {
    preselect: {
      alumnoMoodleId: url.searchParams.get('alumnoId') ? Number(url.searchParams.get('alumnoId')) : null,
      alumnoNombre: url.searchParams.get('alumnoNombre') ?? null
    }
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const form = await request.formData();

    const input = {
      alumnoMoodleId: parseInt(form.get('alumnoMoodleId')?.toString() ?? '0', 10),
      alumnoNombre: form.get('alumnoNombre')?.toString() ?? '',
      fechaReincorporacion: form.get('fechaReincorporacion')?.toString() ?? '',
      observaciones: form.get('observaciones')?.toString() || undefined,
      documentoUrl: form.get('documentoUrl')?.toString() || undefined,
      linkedFaltaId: form.get('linkedFaltaId') ? parseInt(form.get('linkedFaltaId')!.toString(), 10) : undefined
    };

    const parsed = NuevaReincorporacionSchema.safeParse(input);
    if (!parsed.success) {
      return fail(422, { error: 'Datos inválidos', details: parsed.error.flatten() });
    }

    try {
      const id = await crearReincorporacion(locals.usuario.usuarioId, parsed.data);
      await registrarAccion({
        usuarioId: locals.usuario.usuarioId,
        accion: 'crear_reincorporacion',
        tablaDestino: 'reincorporaciones',
        idDestino: id,
        ip: ipDe(request)
      });
    } catch (err) {
      return fail(500, { error: err instanceof Error ? err.message : 'Error al guardar' });
    }

    throw redirect(303, '/preceptor/reincorporaciones');
  }
};
