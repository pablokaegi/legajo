import { fail } from '@sveltejs/kit';
import { listarCursos, listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { registrarDerivacion } from '$lib/server/services/gabinete.js';
import { exigirStaff } from '$lib/server/agrupamientos/acceso.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import { categoriasValidas, CATEGORIA_POR_ID, esUrgente } from '$lib/gabinete/categorias.js';
import type { PageServerLoad, Actions } from './$types';

// Cualquier docente/preceptor puede derivar; NO puede ver los casos.
export const load: PageServerLoad = async ({ locals, url }) => {
  await exigirStaff(locals.usuario);
  const cursos = (await listarCursos().catch(() => [])).map((c) => ({ id: c.id, nombre: c.displayname || c.fullname }));
  const cursoId = Number(url.searchParams.get('curso'));
  const alumnos = Number.isInteger(cursoId) && cursoId > 0
    ? (await listarAlumnosDeCurso(cursoId).catch(() => [])).map((u) => ({ id: u.id, nombre: u.fullname }))
    : [];
  const alumnoId = Number(url.searchParams.get('alumno'));
  return {
    cursos,
    cursoId: alumnos.length ? cursoId : null,
    alumnos,
    alumnoId: alumnos.some((a) => a.id === alumnoId) ? alumnoId : null
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const usuarioId = await exigirStaff(locals.usuario);
    const fd = await request.formData();
    const cursoId = Number(fd.get('cursoId'));
    const alumnoId = Number(fd.get('alumnoId'));
    const queObservo = String(fd.get('queObservo') ?? '').trim().slice(0, 3000);
    const desdeCuando = String(fd.get('desdeCuando') ?? '').trim().slice(0, 300);
    const queSeHizo = String(fd.get('queSeHizo') ?? '').trim().slice(0, 2000);
    const fortalezas = String(fd.get('fortalezas') ?? '').trim().slice(0, 2000) || null;
    const categorias = categoriasValidas(fd.getAll('categoria'));
    if (categorias.length === 0) return fail(400, { error: 'Elegí al menos un motivo de la lista.' });

    const cursos = await listarCursos().catch(() => []);
    const curso = cursos.find((c) => c.id === cursoId);
    const alumnos = curso ? await listarAlumnosDeCurso(cursoId).catch(() => []) : [];
    const alumno = alumnos.find((a) => a.id === alumnoId);
    if (!curso || !alumno) return fail(400, { error: 'Elegí el curso y el alumno.' });

    const motivo = [
      `Motivos: ${categorias.map((id) => CATEGORIA_POR_ID.get(id)!.nombre).join(', ')}.`,
      queObservo ? `Qué se observó: ${queObservo}` : '',
      desdeCuando ? `Desde cuándo: ${desdeCuando}` : '',
      queSeHizo ? `Qué se intentó en el aula: ${queSeHizo}` : ''
    ].filter(Boolean).join('\n');

    const { casoId } = await registrarDerivacion({
      alumnoMoodleId: alumno.id,
      alumnoNombre: alumno.fullname,
      cursoMoodleId: cursoId,
      cursoNombre: curso.displayname || curso.fullname,
      motivo,
      categorias,
      fortalezas,
      derivadoPor: usuarioId
    });
    await registrarAccion({
      usuarioId, accion: 'gabinete.derivar', tablaDestino: 'gabinete_casos', idDestino: casoId, ip: ipDe(request)
    });
    return {
      ok: `Derivación de ${alumno.fullname} enviada al gabinete. Gracias: el equipo se va a contactar con vos.`,
      urgente: esUrgente(categorias)
    };
  }
};
