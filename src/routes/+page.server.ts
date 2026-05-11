import { moodle } from '$lib/server/moodle/client.js';
import { listarCursos } from '$lib/server/services/cursos.js';
import { db } from '$lib/server/db/index.js';
import { syncLogs } from '$lib/server/db/schema.js';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const [moodleResult, logsResult, cursosResult] = await Promise.allSettled([
    moodle.getSiteInfo(),
    db.select().from(syncLogs).orderBy(desc(syncLogs.createdAt)).limit(5),
    listarCursos()
  ]);

  // ─── Estado Moodle ──────────────────────────────────────────────────────
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

  // ─── Logs ───────────────────────────────────────────────────────────────
  const logs = logsResult.status === 'fulfilled' ? logsResult.value : [];

  // ─── Cursos ─────────────────────────────────────────────────────────────
  const totalCursos = cursosResult.status === 'fulfilled' ? cursosResult.value.length : 0;

  return {
    docente: locals.docente,
    moodleStatus,
    totalCursos,
    logs
  };
};
