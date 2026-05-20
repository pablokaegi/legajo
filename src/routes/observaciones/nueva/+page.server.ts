import { fail, redirect } from '@sveltejs/kit';
import { listarCursos } from '$lib/server/services/cursos.js';
import {
  crearObservacionesBulk,
  ObservacionBaseSchema
} from '$lib/server/services/observaciones.js';
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

    // Parsear alumnos (bulk: JSON array)
    let alumnos: Array<{ alumnoMoodleId: number; alumnoNombre: string }> = [];
    try {
      const raw = String(formData.get('alumnos') ?? '[]');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return fail(400, { error: 'Debe seleccionar al menos un alumno' });
      }
      alumnos = parsed.map((a: { alumnoMoodleId: unknown; alumnoNombre: unknown }) => ({
        alumnoMoodleId: Number(a.alumnoMoodleId),
        alumnoNombre: String(a.alumnoNombre ?? '')
      })).filter(a => a.alumnoMoodleId > 0 && a.alumnoNombre.length > 0);
    } catch {
      return fail(400, { error: 'Datos de alumnos inválidos' });
    }

    if (alumnos.length === 0) {
      return fail(400, { error: 'Debe seleccionar al menos un alumno' });
    }

    // Campos de evaluación opcionales
    const usarEval = formData.get('usarEvaluacion') === '1';

    const base = {
      cursoMoodleId: parseInt(String(formData.get('cursoMoodleId') ?? ''), 10),
      cursoNombre: String(formData.get('cursoNombre') ?? ''),
      actitud: usarEval ? parseInt(String(formData.get('actitud') ?? ''), 10) : null,
      tareaCompleta: usarEval ? formData.get('tareaCompleta') === 'true' : null,
      participacion: usarEval ? parseInt(String(formData.get('participacion') ?? ''), 10) : null,
      observacionTexto: String(formData.get('observacionTexto') ?? '').trim() || null,
      fecha: String(formData.get('fecha') ?? '')
    };

    const parsed = ObservacionBaseSchema.safeParse(base);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return fail(400, {
        error: Object.values(errors).flat()[0] ?? 'Datos invalidos'
      });
    }

    const cantidad = await crearObservacionesBulk(
      locals.usuario.usuarioId,
      alumnos,
      parsed.data
    );

    redirect(303, `/observaciones/historial?guardado=${cantidad}`);
  }
};
