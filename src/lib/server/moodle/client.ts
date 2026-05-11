// MoodleClient: punto de entrada único para toda comunicación con Moodle.
// El token vive ÚNICAMENTE aquí y en process.env. Nunca sale al cliente.
//
// ─── Cambiar de adapter ──────────────────────────────────────────────────────
// Fase 1-2: MoodleAdapterV1 (API clásica)
// Fase 3: cambiar a MoodleAdapterV2 (API REST v2/OpenAPI)
// Solo hay que cambiar la línea de instanciación en getMoodleClient().

import { MoodleAdapterV1 } from './adapter-v1.js';
import { toMoodleErrorMessage } from './errors.js';
import type { IMoodleAdapter, MoodleSiteInfo, MoodleCourse, MoodleUser, MoodleUserGrades } from './types.js';
import { db } from '../db/index.js';
import { syncLogs, cacheCursos } from '../db/schema.js';
import { env } from '$env/dynamic/private';
import { gte } from 'drizzle-orm';

function getAdapter(): IMoodleAdapter {
  const url = env.MOODLE_URL;
  const token = env.MOODLE_TOKEN;

  if (!url) throw new Error('[legajo] MOODLE_URL no está configurada');
  if (!token) throw new Error('[legajo] MOODLE_TOKEN no está configurada');

  // Fase 3: return new MoodleAdapterV2(url, token);
  return new MoodleAdapterV1(url, token);
}

// Instancia singleton del adaptador
let _adapter: IMoodleAdapter | null = null;
function getAdapterInstance(): IMoodleAdapter {
  if (!_adapter) _adapter = getAdapter();
  return _adapter;
}

// ─── Cache en memoria para getSiteInfo (sobrevive HMR) ───────────────────────
const SITE_INFO_TTL_MS = 5 * 60 * 1000; // 5 minutos

interface SiteInfoCache {
  data: MoodleSiteInfo;
  timestamp: number;
}

const _global = globalThis as typeof globalThis & { __legajoSiteInfoCache?: SiteInfoCache };

function getSiteInfoCache(): SiteInfoCache | null {
  const cached = _global.__legajoSiteInfoCache;
  if (cached && Date.now() - cached.timestamp < SITE_INFO_TTL_MS) return cached;
  return null;
}

function setSiteInfoCache(data: MoodleSiteInfo) {
  _global.__legajoSiteInfoCache = { data, timestamp: Date.now() };
}

// ─── Logging interno ──────────────────────────────────────────────────────────
async function logSync(tipo: string, status: 'ok' | 'error', mensaje: string, payload?: unknown) {
  try {
    await db.insert(syncLogs).values({
      tipo,
      status,
      mensaje,
      payloadJson: payload ? JSON.stringify(payload) : null
    });
  } catch {
    // El log no debe romper el flujo principal
  }
}

// ─── API pública del cliente ──────────────────────────────────────────────────
export const moodle = {
  async getSiteInfo(): Promise<MoodleSiteInfo> {
    const cached = getSiteInfoCache();
    if (cached) return cached.data;

    try {
      const info = await getAdapterInstance().getSiteInfo();
      setSiteInfoCache(info);
      await logSync('site_info', 'ok', `Conectado como ${info.username} en ${info.sitename}`);
      return info;
    } catch (err) {
      const msg = toMoodleErrorMessage(err);
      await logSync('site_info', 'error', msg);
      throw err;
    }
  },

  async getCourses(): Promise<MoodleCourse[]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const cached = await db.select()
      .from(cacheCursos)
      .where(gte(cacheCursos.cachedAt, oneHourAgo));

    if (cached.length > 0) {
      return cached.map(c => JSON.parse(c.dataJson) as MoodleCourse);
    }

    try {
      const courses = await getAdapterInstance().getCourses();

      for (const c of courses) {
        await db.insert(cacheCursos).values({
          moodleId: c.id,
          nombre: c.fullname,
          shortname: c.shortname,
          dataJson: JSON.stringify(c)
        }).onDuplicateKeyUpdate({
          set: {
            nombre: c.fullname,
            shortname: c.shortname,
            dataJson: JSON.stringify(c),
            cachedAt: new Date()
          }
        });
      }

      await logSync('get_courses', 'ok', `${courses.length} cursos obtenidos`);
      return courses;
    } catch (err) {
      const msg = toMoodleErrorMessage(err);
      await logSync('get_courses', 'error', msg);
      throw err;
    }
  },

  async getEnrolledUsers(courseId: number): Promise<MoodleUser[]> {
    try {
      const users = await getAdapterInstance().getEnrolledUsers(courseId);
      await logSync('enrolled_users', 'ok', `${users.length} usuarios en curso ${courseId}`);
      return users;
    } catch (err) {
      const msg = toMoodleErrorMessage(err);
      await logSync('enrolled_users', 'error', msg, { courseId });
      throw err;
    }
  },

  async searchUsers(query: string): Promise<MoodleUser[]> {
    try {
      const users = await getAdapterInstance().searchUsers(query);
      return users;
    } catch (err) {
      const msg = toMoodleErrorMessage(err);
      await logSync('search_users', 'error', msg, { query });
      throw err;
    }
  },

  async getGradeItems(courseId: number, userId: number): Promise<MoodleUserGrades> {
    try {
      const grades = await getAdapterInstance().getGradeItems(courseId, userId);
      await logSync('grade_items', 'ok', `Notas de usuario ${userId} en curso ${courseId}`);
      return grades;
    } catch (err) {
      const msg = toMoodleErrorMessage(err);
      await logSync('grade_items', 'error', msg, { courseId, userId });
      throw err;
    }
  }
};
