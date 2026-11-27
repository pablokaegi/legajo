// Adaptador para la API clásica REST de Moodle
// Endpoint: POST /webservice/rest/server.php
//
// ─── Fase 3 ───────────────────────────────────────────────────────────────────
// Para migrar a la API REST v2 (OpenAPI), implementar IMoodleAdapter en
// adapter-v2.ts y cambiar la instancia en client.ts.
// La interfaz IMoodleAdapter garantiza compatibilidad sin tocar esta capa.

import type {
  IMoodleAdapter,
  MoodleSiteInfo,
  MoodleCourse,
  MoodleCategory,
  MoodleUser,
  MoodleUserGrades,
  MoodleSearchUsersResponse
} from './types.js';
import { normalizarItemCalificacion, type MoodleGradeItemRest } from './grade-items.js';
import { llamarMoodleRest } from './rest.js';

export class MoodleAdapterV1 implements IMoodleAdapter {
  private readonly endpoint: string;

  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
    private readonly redirect: RequestRedirect = 'follow'
  ) {
    this.endpoint = `${baseUrl}/webservice/rest/server.php`;
  }

  private call<T>(wsfunction: string, params: Record<string, string | number> = {}): Promise<T> {
    return llamarMoodleRest<T>(this.endpoint, this.token, wsfunction, params, this.redirect);
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

  async getCategories(): Promise<MoodleCategory[]> {
    // Sin parámetros devuelve todas las categorías accesibles por el token
    const result = await this.call<MoodleCategory[]>('core_course_get_categories');
    return Array.isArray(result) ? result : [];
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
      gradeitems: MoodleGradeItemRest[];
    }> }>('gradereport_user_get_grade_items', {
      courseid: courseId,
      userid: userId
    });

    const entry = result.usergrades?.find((user) => user.userid === userId);
    if (!entry) {
      return { userid: userId, userfullname: '', gradeitems: [] };
    }

    return {
      userid: entry.userid,
      userfullname: entry.userfullname,
      gradeitems: entry.gradeitems.map(normalizarItemCalificacion)
    };
  }
}
