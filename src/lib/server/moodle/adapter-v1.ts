// Adaptador para la API clásica REST de Moodle
// Endpoint: POST /webservice/rest/server.php
// Documentación: https://aulavirtual.pds.edu.ar/admin/webservice/documentation.php
//
// ─── Fase 3 ───────────────────────────────────────────────────────────────────
// Para migrar a la API REST v2 (OpenAPI), implementar IMoodleAdapter en
// adapter-v2.ts y cambiar la instancia en client.ts.
// La interfaz IMoodleAdapter garantiza compatibilidad sin tocar esta capa.

import type {
  IMoodleAdapter,
  MoodleSiteInfo,
  MoodleCourse,
  MoodleUser,
  MoodleUserGrades,
  MoodleGradeItem,
  MoodleSearchUsersResponse,
  MoodleErrorResponse
} from './types.js';
import { MoodleApiError, MoodleNetworkError } from './errors.js';

export class MoodleAdapterV1 implements IMoodleAdapter {
  private readonly endpoint: string;

  constructor(
    private readonly baseUrl: string,
    private readonly token: string
  ) {
    this.endpoint = `${baseUrl}/webservice/rest/server.php`;
  }

  // Realiza una llamada al web service de Moodle vía POST con form-urlencoded.
  // El token NUNCA sale de este módulo hacia el cliente.
  private async call<T>(wsfunction: string, params: Record<string, string | number> = {}): Promise<T> {
    const body = new URLSearchParams({
      wstoken: this.token,
      wsfunction,
      moodlewsrestformat: 'json'
    });

    for (const [key, value] of Object.entries(params)) {
      body.set(key, String(value));
    }

    let res: Response;
    try {
      res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: AbortSignal.timeout(10_000) // 10 segundos de timeout
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'TimeoutError') {
        throw new MoodleNetworkError('La solicitud tardó demasiado (timeout 10s)');
      }
      throw new MoodleNetworkError(err instanceof Error ? err.message : String(err));
    }

    if (!res.ok) {
      throw new MoodleNetworkError(`HTTP ${res.status} ${res.statusText}`);
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      throw new MoodleNetworkError('La respuesta de Moodle no es JSON válido');
    }

    // Moodle devuelve errores como objeto JSON con campo "exception"
    if (data && typeof data === 'object' && 'exception' in data) {
      throw new MoodleApiError(data as MoodleErrorResponse);
    }

    return data as T;
  }

  async getSiteInfo(): Promise<MoodleSiteInfo> {
    return this.call<MoodleSiteInfo>('core_webservice_get_site_info');
  }

  async getCourses(): Promise<MoodleCourse[]> {
    // Sin parámetros devuelve todos los cursos accesibles por el token
    const result = await this.call<{ courses?: MoodleCourse[] } | MoodleCourse[]>('core_course_get_courses');
    // La API puede devolver el array directo o envuelto en { courses: [...] }
    if (Array.isArray(result)) return result;
    if (result && 'courses' in result && Array.isArray(result.courses)) return result.courses;
    return [];
  }

  async getEnrolledUsers(courseId: number): Promise<MoodleUser[]> {
    return this.call<MoodleUser[]>('core_enrol_get_enrolled_users', { courseid: courseId });
  }

  async searchUsers(query: string): Promise<MoodleUser[]> {
    const result = await this.call<MoodleSearchUsersResponse>('core_user_get_users', {
      'criteria[0][key]': 'fullname',
      'criteria[0][value]': `%${query}%`
    });
    return result.users ?? [];
  }

  async getGradeItems(courseId: number, userId: number): Promise<MoodleUserGrades> {
    // gradereport_user_get_grade_items devuelve { usergrades: [...] }
    const result = await this.call<{ usergrades: Array<{
      userid: number;
      userfullname: string;
      gradeitems: Array<{
        id: number;
        itemname: string | null;
        itemtype: string;
        itemmodule: string | null;
        grademin: number;
        grademax: number;
        graderaw: number | null;
        gradepercent: number | null;
        gradeformatted: string;
        feedback: string | null;
      }>;
    }> }>('gradereport_user_get_grade_items', {
      courseid: courseId,
      userid: userId
    });

    const entry = result.usergrades?.[0];
    if (!entry) {
      return { userid: userId, userfullname: '', gradeitems: [] };
    }

    return {
      userid: entry.userid,
      userfullname: entry.userfullname,
      gradeitems: entry.gradeitems.map(item => ({
        id: item.id,
        itemname: item.itemname,
        itemtype: item.itemtype,
        itemmodule: item.itemmodule,
        grademin: item.grademin,
        grademax: item.grademax,
        graderaw: item.graderaw ?? null,
        gradepercent: item.gradepercent ?? null,
        gradeformatted: item.gradeformatted,
        feedback: item.feedback ?? null
      }))
    };
  }
}
