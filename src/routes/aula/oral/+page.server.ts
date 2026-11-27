import { error, fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { z } from 'zod';
import { APOYOS_ORAL, ORAL_CIENCIAS } from '$lib/aula/oral.js';
import { crearMoodleAula } from '$lib/server/moodle/aula.js';
import { ErrorAulaOral, guardarOral, listarOrales, publicarOrales } from '$lib/server/services/aulaOral.js';
import { aulaPilotoHabilitada } from '$lib/server/services/aulaPiloto.js';
import { puedeEvaluarCurso } from '$lib/server/services/authz.js';
import type { Actions, PageServerLoad } from './$types';

const idPositivo = z.number().int().positive().safe();
const revision = z.object({ alumnoId: idPositivo, revision: z.number().int().nonnegative().safe() });
const nivel = z.enum(['0', '1', '2']).transform(Number).nullable();
const apoyo = z.union([z.enum(APOYOS_ORAL), z.literal('').transform(() => null)]);
const registro = revision.extend({
  estado: z.enum(['evaluado', 'ausente', 'sin_observar']),
  caudales: nivel, unidades: nivel, justificacion: nivel,
  devolucion: z.string().trim().max(500),
  cambioApoyo: z.object({ anterior: apoyo, elegido: apoyo }).optional(),
  revisarRubrica: z.boolean()
});
const lote = z.array(revision).min(1).max(50).refine((items) => new Set(items.map((item) => item.alumnoId)).size === items.length);

async function acceso(locals: App.Locals) {
  if (!aulaPilotoHabilitada()) error(404, 'Aula en Legajo está disponible en el entorno de prueba.');
  if (!locals.usuario) redirect(303, '/auth?redirect=%2Faula%2Foral');
  const usuarioId = locals.usuario.usuarioId;
  const cursoId = idPositivo.safeParse(Number(env.MOODLE_AULA_CURSO_ID));
  const tareaId = idPositivo.safeParse(Number(env.MOODLE_AULA_TAREA_ID));
  if (!cursoId.success || !tareaId.success) error(503, 'Falta configurar el curso y la tarea de Ciencias en Moodle de prueba.');
  if (!(await puedeEvaluarCurso(usuarioId, cursoId.data))) error(403, 'Este curso no está asignado a tu cuenta docente.');
  return { usuarioId, destino: { cursoId: cursoId.data, tareaId: tareaId.data } };
}

async function destinoMoodle(destino: { cursoId: number; tareaId: number }) {
  try {
    const moodle = crearMoodleAula();
    const [tarea, alumnos] = await Promise.all([
      moodle.obtenerTarea(destino.cursoId, destino.tareaId), moodle.listarAlumnos(destino.cursoId)
    ]);
    if (tarea.calificacionMaxima !== 10) throw new Error('Escala de prueba inválida');
    return { moodle, tarea, alumnos };
  } catch {
    error(503, 'No se pudo cargar el curso o la tarea individual sobre 10 de Moodle de prueba.');
  }
}

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
  const { destino } = await acceso(locals);
  setHeaders({ 'cache-control': 'no-store' });
  const [{ tarea, alumnos }, orales] = await Promise.all([destinoMoodle(destino), listarOrales(destino)]);
  const registros = new Map(orales.map((fila) => [fila.alumnoId, fila]));
  return {
    actividad: ORAL_CIENCIAS,
    cursoId: destino.cursoId,
    tarea: { nombre: tarea.nombre },
    alumnos: alumnos.map((alumno) => ({ ...alumno, oral: registros.get(alumno.id) ?? null }))
  };
};

export const actions: Actions = {
  guardar: async ({ request, locals }) => {
    const { usuarioId, destino } = await acceso(locals);
    const datos = await request.formData();
    const resultado = registro.safeParse({
      alumnoId: Number(datos.get('alumnoId')), revision: Number(datos.get('revision')),
      estado: datos.get('estado'), caudales: datos.get('caudales'), unidades: datos.get('unidades'),
      justificacion: datos.get('justificacion'), devolucion: datos.get('devolucion') ?? '',
      cambioApoyo: datos.has('apoyo') ? { anterior: datos.get('apoyoAnterior'), elegido: datos.get('apoyo') } : undefined,
      revisarRubrica: datos.get('revisarRubrica') === 'si'
    });
    if (!resultado.success) return fail(400, { error: 'Revisá el estado, los criterios, el apoyo y la devolución.' });
    const { alumnos } = await destinoMoodle(destino);
    if (!alumnos.some((alumno) => alumno.id === resultado.data.alumnoId)) error(403, 'El estudiante no está matriculado en este curso de prueba.');
    const valores = resultado.data;
    if (valores.estado !== 'evaluado') {
      valores.caudales = valores.unidades = valores.justificacion = null;
    }
    try {
      await guardarOral(destino, usuarioId, valores);
      return { guardado: valores.alumnoId };
    } catch (err) {
      if (err instanceof ErrorAulaOral) return fail(409, { error: err.message });
      throw err;
    }
  },

  publicar: async ({ request, locals }) => {
    const { usuarioId, destino } = await acceso(locals);
    const form = await request.formData();
    if (form.get('confirmar') !== 'si') return fail(400, { error: 'Confirmá la publicación a Moodle de prueba.' });
    let seleccion: unknown;
    try {
      seleccion = JSON.parse(String(form.get('seleccion')));
    } catch {
      return fail(400, { error: 'No se pudo leer la selección de evaluaciones.' });
    }
    const datos = lote.safeParse(seleccion);
    if (!datos.success) return fail(400, { error: 'Seleccioná evaluaciones válidas para publicar.' });
    const { moodle, alumnos } = await destinoMoodle(destino);
    const ids = new Set(alumnos.map((alumno) => alumno.id));
    if (datos.data.some((fila) => !ids.has(fila.alumnoId))) error(403, 'El padrón de Moodle cambió. Recargá el curso.');
    try {
      return { envio: await publicarOrales(destino, usuarioId, datos.data, moodle) };
    } catch (err) {
      if (err instanceof ErrorAulaOral) return fail(409, { error: err.message });
      throw err;
    }
  }
};
