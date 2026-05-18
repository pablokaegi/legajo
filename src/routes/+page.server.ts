import { redirect } from '@sveltejs/kit';
import { moodle } from '$lib/server/moodle/client.js';
import { listarCursos } from '$lib/server/services/cursos.js';
import { db } from '$lib/server/db/index.js';
import { syncLogs } from '$lib/server/db/schema.js';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  const [moodleResult, logsResult, cursosResult] = await Promise.allSettled([
    moodle.getSiteInfo(),
    db.select().from(syncLogs).orderBy(desc(syncLogs.createdAt)).limit(5),
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

  const logs = logsResult.status === 'fulfilled' ? logsResult.value : [];
  const totalCursos = cursosResult.status === 'fulfilled' ? cursosResult.value.length : 0;

  return {
    usuario: locals.usuario,
    moodleStatus,
    totalCursos,
    logs
  };
};
