import { redirect, fail } from '@sveltejs/kit';
import { listarCursosPreceptoria, listarAlumnosDeCurso, verificarAlumnosDelCurso } from '$lib/server/services/cursos.js';
import { alcancePreceptoria, puedeGestionarPreceptoriaCurso } from '$lib/server/services/authz.js';
import { crearFalta, NuevaFaltaSchema } from '$lib/server/services/faltas.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const permitidos = await alcancePreceptoria(locals.usuario.usuarioId);
  const cursos = (await listarCursosPreceptoria().catch(() => [])).filter((curso) => !permitidos || permitidos.includes(curso.id));

  // Handle preselect when navigating from cursos/[id] bulk action bar
  const cursoIdParam = url.searchParams.get('cursoId');
  const alumnosParam = url.searchParams.get('alumnos'); // comma-separated Moodle user IDs

  let preselect: {
    cursoId: number;
    cursoNombre: string;
    alumnos: { id: number; fullname: string }[];
  } | null = null;

  if (cursoIdParam && alumnosParam) {
    const cursoId = parseInt(cursoIdParam, 10);
    const alumnoIds = new Set(
      alumnosParam.split(',').map(Number).filter(n => !isNaN(n) && n > 0)
    );

    if (cursos.some((c) => c.id === cursoId) && alumnoIds.size > 0) {
      const estudiantes = await listarAlumnosDeCurso(cursoId).catch(() => []);
      const found = estudiantes.filter(a => alumnoIds.has(a.id));

      // Fallback course name from the courses list
      const cursoNombre =
        cursos.find(c => c.id === cursoId)?.displayname ??
        cursos.find(c => c.id === cursoId)?.fullname ??
        `Curso ${cursoId}`;

      preselect = {
        cursoId,
        cursoNombre,
        alumnos: found.map(a => ({ id: a.id, fullname: a.fullname }))
      };
    }
  }

  return { cursos, preselect };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.usuario) throw redirect(303, '/auth');

    const form = await request.formData();
    const alumnosRaw = form.get('alumnos')?.toString() ?? '[]';

    let alumnos: { alumnoMoodleId: number; alumnoNombre: string }[] = [];
    try {
      alumnos = JSON.parse(alumnosRaw);
    } catch {
      return fail(400, { error: 'Datos de alumnos inválidos' });
    }

    const input = {
      fecha: form.get('fecha')?.toString() ?? '',
      tipo: form.get('tipo')?.toString() ?? '',
      descripcion: form.get('descripcion')?.toString() || undefined,
      cursoMoodleId: parseInt(form.get('cursoMoodleId')?.toString() ?? '0', 10),
      cursoNombre: form.get('cursoNombre')?.toString() ?? '',
      visibilidad: form.get('visibilidad')?.toString() || 'publica',
      alumnos
    };

    const parsed = NuevaFaltaSchema.safeParse(input);
    if (!parsed.success) {
      return fail(422, { error: 'Datos inválidos', details: parsed.error.flatten() });
    }
    if (!(await puedeGestionarPreceptoriaCurso(locals.usuario.usuarioId, parsed.data.cursoMoodleId))) {
      return fail(403, { error: 'No tenés permisos de preceptoría para este curso.' });
    }
    let padron;
    try {
      padron = await verificarAlumnosDelCurso(parsed.data.cursoMoodleId, parsed.data.alumnos.map((a) => a.alumnoMoodleId));
    } catch {
      return fail(503, { error: 'No se pudo verificar la matrícula en Moodle.' });
    }
    if (!padron) return fail(400, { error: 'Algún alumno no pertenece al curso.' });

    try {
      const notas = new Map(parsed.data.alumnos.map((a) => [a.alumnoMoodleId, a.nota]));
      const id = await crearFalta(locals.usuario.usuarioId, {
        ...parsed.data,
        cursoNombre: padron.cursoNombre,
        alumnos: padron.alumnos.map((a) => ({ ...a, nota: notas.get(a.alumnoMoodleId) }))
      });
      await registrarAccion({
        usuarioId: locals.usuario.usuarioId,
        accion: 'crear_falta',
        tablaDestino: 'faltas',
        idDestino: id,
        ip: ipDe(request)
      });
    } catch (err) {
      return fail(500, { error: err instanceof Error ? err.message : 'Error al guardar' });
    }

    throw redirect(303, '/preceptor/faltas');
  }
};
