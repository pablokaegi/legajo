import { redirect } from '@sveltejs/kit';
import { moodle } from '$lib/server/moodle/client.js';
import { listarCursos } from '$lib/server/services/cursos.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  const [moodleResult, cursosResult] = await Promise.allSettled([
    moodle.getSiteInfo(),
    listarCursos()
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
    totalCursos
  };
};
