import { fail, redirect } from '@sveltejs/kit';
import { listarCursos, listarAlumnosDeCurso, verificarAlumnosDelCurso } from '$lib/server/services/cursos.js';
import {
  crearObservacionesBulk,
  ObservacionBaseSchema
} from '$lib/server/services/observaciones.js';
import { cursosVisiblesPara, puedeCrearObservacion, puedeVerCurso } from '$lib/server/services/authz.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  if (!(await puedeCrearObservacion(locals.usuario.usuarioId))) {
    throw redirect(303, '/observaciones/historial');
  }

  const cursos = await cursosVisiblesPara(locals.usuario.usuarioId, await listarCursos().catch(() => []));
  const curso = cursos.find((c) => c.id === Number(url.searchParams.get('cursoId')));
  const alumnoId = Number(url.searchParams.get('alumnoId'));
  const alumnoIds = new Set((url.searchParams.get('alumnos') ?? '').split(',').map(Number));
  const estudiantes = curso && (alumnoId > 0 || url.searchParams.has('alumnos'))
    ? await listarAlumnosDeCurso(curso.id).catch(() => [])
    : [];
  const alumno = estudiantes.find((a) => a.id === alumnoId);
  const encontrados = estudiantes.filter((a) => alumnoIds.has(a.id));

  return {
    cursos,
    preselect: {
      cursoId: curso?.id ?? null,
      alumnoId: alumno?.id ?? null,
      alumnoNombre: alumno?.fullname ?? null,
      cursoNombre: (curso?.displayname || curso?.fullname) ?? null,
      alumnos: encontrados.length ? encontrados.map((a) => ({ id: a.id, fullname: a.fullname })) : null
    }
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.usuario) {
      return fail(401, { error: 'No autorizado' });
    }

    const formData = await request.formData();

    // Parsear alumnos (bulk: JSON array)
    let alumnoIds: number[];
    try {
      const raw = String(formData.get('alumnos') ?? '[]');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return fail(400, { error: 'Debe seleccionar al menos un alumno' });
      }
      alumnoIds = parsed.map((a: { alumnoMoodleId: unknown }) => Number(a.alumnoMoodleId));
    } catch {
      return fail(400, { error: 'Datos de alumnos inválidos' });
    }

    // Campos de evaluación opcionales
    const usarEval = formData.get('usarEvaluacion') === '1';

    const base = {
      cursoMoodleId: Number(formData.get('cursoMoodleId')),
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

    if (!(await puedeVerCurso(locals.usuario.usuarioId, parsed.data.cursoMoodleId))) {
      return fail(403, { error: 'No tenés permiso para registrar observaciones en este curso.' });
    }
    let padron;
    try {
      padron = await verificarAlumnosDelCurso(parsed.data.cursoMoodleId, alumnoIds);
    } catch {
      return fail(503, { error: 'No se pudo verificar la matrícula en Moodle.' });
    }
    if (!padron) return fail(400, { error: 'Algún alumno no pertenece al curso.' });
    const cantidad = await crearObservacionesBulk(
      locals.usuario.usuarioId,
      padron.alumnos,
      { ...parsed.data, cursoNombre: padron.cursoNombre }
    );

    redirect(303, `/observaciones/historial?guardado=${cantidad}`);
  }
};
