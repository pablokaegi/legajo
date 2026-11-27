import { error, fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { actividadCiencias, esquemaLibro, type ActividadLibro } from '$lib/laboratorio/libro';
import { ErrorLibro, libroCiencias } from '$lib/server/moodle/libro-ciencias';
import { aulaPilotoHabilitada } from '$lib/server/services/aulaPiloto';
import { puedeEvaluarCurso } from '$lib/server/services/authz';
import { registrarAccion } from '$lib/server/services/audit';
import type { Actions, PageServerLoad } from './$types';

type ErrorEdicion = { error: string; borrador?: { actividad: ActividadLibro; revision: number } };

async function acceso(locals: App.Locals) {
  if (!aulaPilotoHabilitada()) error(404, 'El editor está disponible en el laboratorio de prueba.');
  if (!locals.usuario) redirect(303, '/auth?redirect=%2Flaboratorio%2Fapoyos%2Flibro');
  const curso = Number(env.MOODLE_AULA_CURSO_ID);
  if (!Number.isSafeInteger(curso) || curso <= 0) error(503, 'Falta configurar el curso de Ciencias.');
  const usuarioId = locals.usuario.usuarioId;
  if (!(await puedeEvaluarCurso(usuarioId, curso))) error(403, 'El curso de Ciencias no está asignado a tu cuenta docente.');
  return usuarioId;
}

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
  await acceso(locals);
  setHeaders({ 'cache-control': 'private, no-store' });
  try {
    const libro = await libroCiencias(env).leer();
    return { revision: libro.revision, url: libro.url, actividad: libro.actividad ?? actividadCiencias() };
  } catch (err) {
    if (err instanceof ErrorLibro) error(err.status, err.message);
    error(503, 'No se pudo leer el Libro de Ciencias. Revisá la conexión con Moodle y su servicio de publicación.');
  }
};

export const actions: Actions = {
  publicar: async ({ locals, request }) => {
    const usuarioId = await acceso(locals);
    const form = await request.formData();
    const ids = form.getAll('pasoId');
    const titulos = form.getAll('pasoTitulo');
    const consignas = form.getAll('pasoConsigna');
    const audios = form.getAll('pasoAudio');
    if (![titulos, consignas, audios].every((valores) => valores.length === ids.length)) {
      return fail<ErrorEdicion>(400, { error: 'Revisá los campos de cada paso.' });
    }
    const actividad = esquemaLibro.safeParse({
      titulo: form.get('titulo'), objetivo: form.get('objetivo'),
      pasos: ids.map((id, i) => ({ id, titulo: titulos[i], consigna: consignas[i], audio: audios[i] }))
    });
    const revisionFormulario = form.get('revision');
    const revision = Number(revisionFormulario);
    if (!actividad.success || typeof revisionFormulario !== 'string' || !/^\d+$/.test(revisionFormulario) || !Number.isSafeInteger(revision)) {
      return fail<ErrorEdicion>(400, { error: 'Completá el título, el objetivo y la consigna de cada paso. Revisá que haya entre uno y ocho pasos.' });
    }
    const borrador = { actividad: actividad.data, revision };
    if (form.get('confirmar') !== 'si') return fail<ErrorEdicion>(400, { error: 'Confirmá la publicación para el curso.', borrador });
    try {
      const resultado = await libroCiencias(env).publicar(actividad.data, revision);
      if (resultado.cambio) await registrarAccion({ usuarioId, accion: 'aula_libro_publicar', tablaDestino: 'moodle_book', idDestino: resultado.cmid, payload: { revision: resultado.revision } });
      return { resultado };
    } catch (err) {
      if (err instanceof ErrorLibro) return fail<ErrorEdicion>(err.status, { error: err.message, borrador });
      return fail<ErrorEdicion>(503, { error: 'No se pudo verificar el Libro en Moodle. Tus cambios siguen en el editor.', borrador });
    }
  }
};
