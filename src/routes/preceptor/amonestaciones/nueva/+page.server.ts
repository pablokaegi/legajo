import { redirect, fail } from '@sveltejs/kit';
import { crearAmonestacion, NuevaAmonestacionSchema } from '$lib/server/services/amonestaciones.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  return {
    preselect: {
      alumnoMoodleId: url.searchParams.get('alumnoId') ? Number(url.searchParams.get('alumnoId')) : null,
      alumnoNombre: url.searchParams.get('alumnoNombre') ?? null,
      cursoMoodleId: url.searchParams.get('cursoId') ? Number(url.searchParams.get('cursoId')) : null,
      cursoNombre: url.searchParams.get('cursoNombre') ?? null
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
      fecha: form.get('fecha')?.toString() ?? '',
      gravedad: form.get('gravedad')?.toString() ?? '',
      motivo: form.get('motivo')?.toString() ?? '',
      accionesSugeridas: form.get('accionesSugeridas')?.toString() || undefined,
      cursoMoodleId: form.get('cursoMoodleId') ? parseInt(form.get('cursoMoodleId')!.toString(), 10) : undefined,
      cursoNombre: form.get('cursoNombre')?.toString() || undefined
    };

    const parsed = NuevaAmonestacionSchema.safeParse(input);
    if (!parsed.success) {
      return fail(422, { error: 'Datos inválidos', details: parsed.error.flatten() });
    }

    try {
      const id = await crearAmonestacion(locals.usuario.usuarioId, parsed.data);
      await registrarAccion({
        usuarioId: locals.usuario.usuarioId,
        accion: 'crear_amonestacion',
        tablaDestino: 'amonestaciones',
        idDestino: id,
        ip: ipDe(request)
      });
    } catch (err) {
      return fail(500, { error: err instanceof Error ? err.message : 'Error al guardar' });
    }

    throw redirect(303, '/preceptor/amonestaciones');
  }
};
