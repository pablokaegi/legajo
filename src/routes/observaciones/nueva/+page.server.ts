import { fail, redirect } from '@sveltejs/kit';
import { listarCursos } from '$lib/server/services/cursos.js';
import { crearObservacion, ObservacionSchema } from '$lib/server/services/observaciones.js';
import { puedeCrearObservacion } from '$lib/server/services/authz.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  if (!(await puedeCrearObservacion(locals.usuario.usuarioId))) {
    throw redirect(303, '/observaciones/historial');
  }

  const cursos = await listarCursos().catch(() => []);

  return {
    cursos,
    preselect: {
      cursoId: url.searchParams.get('cursoId') ? parseInt(url.searchParams.get('cursoId')!) : null,
      alumnoId: url.searchParams.get('alumnoId') ? parseInt(url.searchParams.get('alumnoId')!) : null,
      alumnoNombre: url.searchParams.get('alumnoNombre') ?? null
    }
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.usuario) {
      return fail(401, { error: 'No autorizado' });
    }

    if (!(await puedeCrearObservacion(locals.usuario.usuarioId))) {
      return fail(403, { error: 'No tenes permiso para crear observaciones' });
    }

    const formData = await request.formData();

    const raw = {
      alumnoMoodleId: parseInt(String(formData.get('alumnoMoodleId') ?? ''), 10),
      alumnoNombre: String(formData.get('alumnoNombre') ?? ''),
      cursoMoodleId: parseInt(String(formData.get('cursoMoodleId') ?? ''), 10),
      cursoNombre: String(formData.get('cursoNombre') ?? ''),
      actitud: parseInt(String(formData.get('actitud') ?? ''), 10),
      tareaCompleta: formData.get('tareaCompleta') === 'true',
      participacion: parseInt(String(formData.get('participacion') ?? ''), 10),
      observacionTexto: String(formData.get('observacionTexto') ?? '').trim() || null,
      fecha: String(formData.get('fecha') ?? '')
    };

    const parsed = ObservacionSchema.safeParse(raw);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return fail(400, {
        error: Object.values(errors).flat()[0] ?? 'Datos invalidos',
        values: raw
      });
    }

    await crearObservacion(locals.usuario.usuarioId, parsed.data);

    redirect(303, '/observaciones/historial?guardado=1');
  }
};
