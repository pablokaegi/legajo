import { redirect, fail } from '@sveltejs/kit';
import { listarCursos, listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { crearReincorporacion, NuevaReincorporacionSchema } from '$lib/server/services/reincorporaciones.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  const cursos = await listarCursos().catch(() => []);

  const cursoIdParam  = url.searchParams.get('cursoId');
  const alumnoIdParam = url.searchParams.get('alumnoId');
  const alumnosParam  = url.searchParams.get('alumnos'); // comma-separated IDs (bulk)

  // Bulk preselect: cursoId + alumnos=id1,id2,...
  if (cursoIdParam && alumnosParam) {
    const cursoId   = parseInt(cursoIdParam, 10);
    const alumnoIds = new Set(
      alumnosParam.split(',').map(Number).filter(n => !isNaN(n) && n > 0)
    );
    if (!isNaN(cursoId) && alumnoIds.size > 0) {
      const estudiantes = await listarAlumnosDeCurso(cursoId).catch(() => []);
      const found = estudiantes.filter(a => alumnoIds.has(a.id));
      const cursoNombre =
        cursos.find(c => c.id === cursoId)?.displayname ??
        cursos.find(c => c.id === cursoId)?.fullname ??
        `Curso ${cursoId}`;
      return {
        cursos,
        preselect: {
          cursoId,
          cursoNombre,
          alumnos: found.map(a => ({ id: a.id, fullname: a.fullname }))
        }
      };
    }
  }

  return {
    cursos,
    preselect: {
      cursoId:      cursoIdParam  ? parseInt(cursoIdParam, 10) : null,
      alumnoId:     alumnoIdParam ? parseInt(alumnoIdParam, 10) : null,
      alumnoNombre: url.searchParams.get('alumnoNombre') ?? null,
      cursoNombre:  null,
      alumnos:      null
    }
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.usuario) throw redirect(303, '/auth');

    const form = await request.formData();

    // Parse bulk alumnos JSON
    let alumnos: Array<{ alumnoMoodleId: number; alumnoNombre: string }> = [];
    try {
      const raw = String(form.get('alumnos') ?? '[]');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return fail(400, { error: 'Debe seleccionar al menos un alumno' });
      }
      alumnos = parsed
        .map((a: { alumnoMoodleId: unknown; alumnoNombre: unknown }) => ({
          alumnoMoodleId: Number(a.alumnoMoodleId),
          alumnoNombre: String(a.alumnoNombre ?? '')
        }))
        .filter(a => a.alumnoMoodleId > 0 && a.alumnoNombre.length > 0);
    } catch {
      return fail(400, { error: 'Datos de alumnos inválidos' });
    }

    if (alumnos.length === 0) {
      return fail(400, { error: 'Debe seleccionar al menos un alumno' });
    }

    const base = {
      fechaReincorporacion: String(form.get('fechaReincorporacion') ?? ''),
      observaciones:  String(form.get('observaciones')  ?? '').trim() || undefined,
      documentoUrl:   String(form.get('documentoUrl')   ?? '').trim() || undefined,
      linkedFaltaId:  form.get('linkedFaltaId')
        ? parseInt(String(form.get('linkedFaltaId')), 10)
        : undefined
    };

    // Validate shared fields with the first alumno (schema requires alumnoMoodleId/Nombre)
    const first = alumnos[0];
    const parsed = NuevaReincorporacionSchema.safeParse({ ...base, ...first });
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return fail(400, { error: Object.values(errors).flat()[0] ?? 'Datos inválidos' });
    }

    try {
      for (const alumno of alumnos) {
        const id = await crearReincorporacion(locals.usuario.usuarioId, {
          ...base,
          alumnoMoodleId: alumno.alumnoMoodleId,
          alumnoNombre:   alumno.alumnoNombre,
          fechaReincorporacion: base.fechaReincorporacion
        });
        await registrarAccion({
          usuarioId:    locals.usuario.usuarioId,
          accion:       'crear_reincorporacion',
          tablaDestino: 'reincorporaciones',
          idDestino:    id,
          ip:           ipDe(request)
        });
      }
    } catch (err) {
      return fail(500, { error: err instanceof Error ? err.message : 'Error al guardar' });
    }

    throw redirect(303, `/preceptor/reincorporaciones?guardado=${alumnos.length}`);
  }
};
