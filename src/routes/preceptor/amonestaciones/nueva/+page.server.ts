import { redirect, fail } from '@sveltejs/kit';
import { crearAmonestacion, NuevaAmonestacionSchema } from '$lib/server/services/amonestaciones.js';
import { listarAlumnosDeCurso, listarCursosPreceptoria, verificarAlumnosDelCurso } from '$lib/server/services/cursos.js';
import { alcancePreceptoria, puedeGestionarAmonestaciones } from '$lib/server/services/authz.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const permitidos = await alcancePreceptoria(locals.usuario.usuarioId);
  const cursos = (await listarCursosPreceptoria().catch(() => [])).filter((curso) => !permitidos || permitidos.includes(curso.id));

  // Preselect when navigating from cursos/[id]
  const alumnoId = Number(url.searchParams.get('alumnoId'));
  const curso = cursos.find((c) => c.id === Number(url.searchParams.get('cursoId')));
  const roster = curso && alumnoId > 0 ? await listarAlumnosDeCurso(curso.id).catch(() => []) : [];
  const alumno = roster.find((a) => a.id === alumnoId);
  const sinCursoLegacy = !permitidos && !url.searchParams.has('cursoId') && alumnoId > 0;
  const preselect = {
    alumnoMoodleId: alumno?.id ?? (sinCursoLegacy ? alumnoId : null),
    alumnoNombre: alumno?.fullname ?? (sinCursoLegacy ? url.searchParams.get('alumnoNombre') : null),
    cursoMoodleId: curso?.id ?? null,
    cursoNombre: (curso?.displayname || curso?.fullname) ?? null
  };
  return { cursos, preselect };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    if (!(await puedeGestionarAmonestaciones(locals.usuario.usuarioId))) return fail(403, { error: 'Sin permiso.' });
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
    const { cursoMoodleId, alumnoMoodleId } = parsed.data;
    const cursos = await alcancePreceptoria(locals.usuario.usuarioId);
    if (cursos && (!cursoMoodleId || !cursos.includes(cursoMoodleId))) {
      return fail(403, { error: 'Elegí un curso asignado a tu rol de preceptoría.' });
    }
    if (cursoMoodleId) {
      let padron;
      try {
        padron = await verificarAlumnosDelCurso(cursoMoodleId, [alumnoMoodleId]);
      } catch {
        return fail(503, { error: 'No se pudo verificar la matrícula en Moodle.' });
      }
      if (!padron) return fail(400, { error: 'El alumno no pertenece al curso.' });
      parsed.data.cursoNombre = padron.cursoNombre;
      parsed.data.alumnoNombre = padron.alumnos[0].alumnoNombre;
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
