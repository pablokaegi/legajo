// Stub para la API REST v2 de Moodle (OpenAPI)
// Endpoint base: https://aulavirtual.pds.edu.ar/r.php/api/rest/v2
// Documentación: https://aulavirtual.pds.edu.ar/admin/swaggerui.php
// OpenAPI JSON: https://aulavirtual.pds.edu.ar/r.php/api/rest/v2/openapi.json
//
// TODO Fase 3: implementar esta clase cuando se quiera migrar a la API moderna.
// La interfaz IMoodleAdapter garantiza que el cambio es transparente para
// el resto del sistema: solo hay que cambiar el adapter en client.ts.

import type {
  IMoodleAdapter,
  MoodleSiteInfo,
  MoodleCourse,
  MoodleCategory,
  MoodleUser,
  MoodleUserGrades
} from './types.js';

export class MoodleAdapterV2 implements IMoodleAdapter {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSiteInfo(): Promise<MoodleSiteInfo> {
    throw new Error('MoodleAdapterV2 no está implementado todavía (Fase 3)');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCourses(): Promise<MoodleCourse[]> {
    throw new Error('MoodleAdapterV2 no está implementado todavía (Fase 3)');
  }

  async getCategories(): Promise<MoodleCategory[]> {
    throw new Error('MoodleAdapterV2 no está implementado todavía (Fase 3)');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getEnrolledUsers(_courseId: number): Promise<MoodleUser[]> {
    throw new Error('MoodleAdapterV2 no está implementado todavía (Fase 3)');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async searchUsers(_query: string): Promise<MoodleUser[]> {
    throw new Error('MoodleAdapterV2 no está implementado todavía (Fase 3)');
  }

  async getGradeItems(_courseId: number, _userId: number): Promise<MoodleUserGrades> {
    throw new Error('MoodleAdapterV2 no está implementado todavía (Fase 3)');
  }
}
