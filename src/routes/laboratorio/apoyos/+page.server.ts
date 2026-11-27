import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { esStaff, puedeEvaluarCurso, puedeGestionarFichaApoyo } from '$lib/server/services/authz.js';
import { aulaPilotoHabilitada } from '$lib/server/services/aulaPiloto.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) redirect(303, `/auth?redirect=${encodeURIComponent(url.pathname)}`);
  if (!(await esStaff(locals.usuario.usuarioId))) {
    error(403, 'El Laboratorio de apoyos es para el personal autorizado.');
  }
  const curso = Number(env.MOODLE_AULA_CURSO_ID);
  if (!aulaPilotoHabilitada() || !Number.isSafeInteger(curso) || curso <= 0) return { fichas: false, libro: false };
  const usuario = locals.usuario.usuarioId;
  const [fichas, libro] = await Promise.all([
    puedeGestionarFichaApoyo(usuario, curso),
    env.MOODLE_AULA_LIBRO_TOKEN?.trim() ? puedeEvaluarCurso(usuario, curso) : false
  ]);
  return { fichas, libro };
};
