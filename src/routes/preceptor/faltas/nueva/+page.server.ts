import { redirect, fail } from '@sveltejs/kit';
import { listarCursosPreceptoria, listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { crearFalta, NuevaFaltaSchema } from '$lib/server/services/faltas.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const cursos = await listarCursosPreceptoria().catch(() => []);

  // Handle preselect when navigating from cursos/[id] bulk action bar
  const cursoIdParam = url.searchParams.get('cursoId');
  const cursoNombreParam = url.searchParams.get('cursoNombre');
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

    if (!isNaN(cursoId) && alumnoIds.size > 0) {
      const estudiantes = await listarAlumnosDeCurso(cursoId).catch(() => []);
      const found = estudiantes.filter(a => alumnoIds.has(a.id));

      // Fallback course name from the courses list
      const cursoNombre =
        cursoNombreParam ??
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

    try {
      const id = await crearFalta(locals.usuario.usuarioId, parsed.data);
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
