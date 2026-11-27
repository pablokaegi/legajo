import { env } from '$env/dynamic/private';
import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { servicioMoodleDePrueba } from '$lib/server/moodle/aula-rest.js';
import { aulaPilotoHabilitada } from '$lib/server/services/aulaPiloto.js';
import { puedeGestionarFichaApoyo, puedeVerEvidenciasDeGabinete } from '$lib/server/services/authz.js';
import { leerEvidenciasFichaCiencias } from '$lib/server/services/evidenciasFichaCiencias.js';
import { ConflictoFichaApoyo, datosFichaApoyo, guardarFichaApoyo, leerFichaApoyo } from '$lib/server/services/fichasApoyo.js';
import type { Actions, PageServerLoad } from './$types';

const id = z.string().regex(/^[1-9]\d*$/).transform(Number).pipe(z.number().int().positive().max(2147483647));
const numeroVersion = z.string().regex(/^(0|[1-9]\d*)$/).transform(Number).pipe(z.number().int().nonnegative().max(2147483647));

type ErrorEdicion = {
  error: string;
  alumnoId?: number;
  version?: number;
  conflicto?: boolean;
  borrador?: Record<string, string>;
};

async function acceso(locals: App.Locals) {
  if (!locals.usuario) redirect(303, '/auth?redirect=%2Flaboratorio%2Fapoyos%2Ffichas');
  if (!aulaPilotoHabilitada()) error(404, 'Las fichas están disponibles en el piloto local.');
  const curso = id.safeParse(env.MOODLE_AULA_CURSO_ID);
  if (!curso.success) error(503, 'Falta configurar el curso de prueba.');
  const usuarioId = locals.usuario.usuarioId;
  if (!(await puedeGestionarFichaApoyo(usuarioId, curso.data))) error(403, 'Este curso no está asignado a tu cuenta.');
  for (const clave of ['MOODLE_AULA_QUIZ_TOKEN', 'MOODLE_AULA_TOKEN'] as const) {
    if (!env[clave]?.trim()) continue;
    try {
      const moodle = servicioMoodleDePrueba(env, clave);
      return { usuarioId, cursoId: curso.data, alumnos: await moodle.listarAlumnos(curso.data) };
    } catch {
      // Ambos servicios de este curso pueden verificar la matrícula activa.
    }
  }
  error(503, 'No se pudo verificar el padrón del curso en Moodle de prueba.');
}

function seleccionar(alumnos: { id: number; nombre: string }[], valor: string | null) {
  if (valor === null) return alumnos[0] ?? null;
  const alumnoId = id.safeParse(valor);
  if (!alumnoId.success) error(400, 'Elegí un estudiante válido.');
  const alumno = alumnos.find((a) => a.id === alumnoId.data);
  if (!alumno) error(403, 'Ese estudiante no está matriculado en el curso de prueba.');
  return alumno;
}

export const load: PageServerLoad = async ({ locals, url, setHeaders }) => {
  setHeaders({ 'cache-control': 'private, no-store' });
  const { usuarioId, cursoId, alumnos } = await acceso(locals);
  const alumno = seleccionar(alumnos, url.searchParams.get('alumnoId'));
  try {
    const gabinete = await puedeVerEvidenciasDeGabinete(usuarioId, cursoId);
    const [ficha, evidencias] = alumno ? await Promise.all([
      leerFichaApoyo(cursoId, alumno.id),
      gabinete ? leerEvidenciasFichaCiencias(env, cursoId, alumno.id).catch(() => null) : null
    ]) : [null, null];
    return { alumnos, alumno, ficha, gabinete, evidencias };
  } catch {
    error(503, 'No se pudo abrir la ficha en Legajo. Volvé a intentar.');
  }
};

export const actions: Actions = {
  guardar: async ({ locals, request, url }) => {
    const { usuarioId, cursoId, alumnos } = await acceso(locals);
    const form = await request.formData();
    const alumnoId = id.safeParse(form.get('alumnoId'));
    const version = numeroVersion.safeParse(form.get('version'));
    if (!alumnoId.success || !version.success) return fail<ErrorEdicion>(400, { error: 'Revisá el estudiante y la versión de la ficha.' });
    const alumno = seleccionar(alumnos, url.searchParams.get('alumnoId') ?? String(alumnoId.data));
    if (alumno?.id !== alumnoId.data) return fail<ErrorEdicion>(400, { error: 'El estudiante del formulario cambió. Volvé a abrir la ficha.' });

    const borrador = Object.fromEntries(datosFichaApoyo.keyof().options.map((campo) => {
      const valor = form.get(campo);
      return [campo, typeof valor === 'string' ? valor : ''];
    }));
    const datos = datosFichaApoyo.safeParse(borrador);
    if (!datos.success) {
      const campo = datos.error.issues[0]?.path[0];
      return fail<ErrorEdicion>(400, { error: `Revisá el campo «${campo === 'revision' ? 'fecha de revisión' : campo}».`, alumnoId: alumno.id,
        borrador: Object.fromEntries(Object.entries(borrador).map(([k, v]) => [k, v.slice(0, 1400)])), version: version.data });
    }
    try {
      const guardada = await guardarFichaApoyo(cursoId, alumno.id, usuarioId, version.data, datos.data);
      return { alumnoId: alumno.id, guardada };
    } catch (err) {
      if (err instanceof ConflictoFichaApoyo) {
        return fail<ErrorEdicion>(409, { alumnoId: alumno.id, error: 'Otra persona guardó cambios en esta ficha.', conflicto: true,
          borrador: datos.data, version: version.data });
      }
      return fail<ErrorEdicion>(503, { alumnoId: alumno.id, error: 'No se pudo confirmar el guardado. Volvé a intentar.',
        borrador: datos.data, version: version.data });
    }
  }
};
