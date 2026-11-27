import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { moodle } from '$lib/server/moodle/client.js';
import { listarCursos } from '$lib/server/services/cursos.js';
import { cursosVisiblesPara, puedeEvaluarCurso, puedeGestionarFichaApoyo } from '$lib/server/services/authz.js';
import { aulaPilotoHabilitada } from '$lib/server/services/aulaPiloto.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  const usuarioId = locals.usuario.usuarioId;
  const cursoAula = Number(env.MOODLE_AULA_CURSO_ID);
  const piloto = aulaPilotoHabilitada();
  const [moodleResult, cursosResult, aulaResult, fichasResult] = await Promise.allSettled([
    moodle.getSiteInfo(),
    listarCursos().then((cursos) => cursosVisiblesPara(usuarioId, cursos)),
    piloto ? puedeEvaluarCurso(usuarioId, cursoAula) : false,
    piloto ? puedeGestionarFichaApoyo(usuarioId, cursoAula) : false
  ]);

  let moodleStatus: { ok: boolean; mensaje: string; sitename?: string; funciones?: string[] };
  if (moodleResult.status === 'fulfilled') {
    const info = moodleResult.value;
    moodleStatus = {
      ok: true,
      mensaje: `Conectado como ${info.username}`,
      sitename: info.sitename,
      funciones: info.functions.map(f => f.name)
    };
  } else {
    moodleStatus = {
      ok: false,
      mensaje: moodleResult.reason instanceof Error ? moodleResult.reason.message : 'Error desconocido'
    };
  }

  const totalCursos = cursosResult.status === 'fulfilled' ? cursosResult.value.length : 0;

  return {
    usuario: locals.usuario,
    moodleStatus,
    totalCursos,
    aulaOralDisponible: aulaResult.status === 'fulfilled' && aulaResult.value,
    apoyosDisponibles: fichasResult.status === 'fulfilled' && fichasResult.value
  };
};
