import type { MoodleErrorResponse } from './types.js';

// Mensajes de error de Moodle traducidos a español
const ERROR_MESSAGES: Record<string, string> = {
  invalidtoken: 'El token de Moodle no es válido. Verificá la configuración en .env.',
  invaliduser: 'El usuario asociado al token no existe o está inactivo en Moodle.',
  accessdenied: 'Sin permisos para esta operación. Habilitá la función en "Legajo API" > Moodle.',
  notloggedin: 'No autenticado en Moodle. El token puede haber expirado.',
  servicerequireslogin: 'El servicio de Moodle requiere autenticación válida.',
  nopermissions: 'El token no tiene permisos suficientes para este recurso.',
  invalidparameter: 'Parámetro inválido enviado a Moodle.',
  missingparam: 'Falta un parámetro requerido.',
  servicenotavailable: 'El web service de Moodle no está disponible o no está habilitado.',
  invalidfunction: 'Función no habilitada en el servicio "Legajo API". Agregala desde la administración de Moodle.',
  codingerror: 'Error interno de Moodle.',
};

export class MoodleApiError extends Error {
  public readonly errorcode: string;
  public readonly moodleMessage: string;

  constructor(response: MoodleErrorResponse) {
    const friendly = ERROR_MESSAGES[response.errorcode] ?? response.message;
    super(friendly);
    this.name = 'MoodleApiError';
    this.errorcode = response.errorcode;
    this.moodleMessage = response.message;
  }
}

export class MoodleNetworkError extends Error {
  constructor(detail: string) {
    super(`No se pudo conectar con Moodle: ${detail}`);
    this.name = 'MoodleNetworkError';
  }
}

// Convierte cualquier error del cliente Moodle en un mensaje entendible
export function toMoodleErrorMessage(err: unknown): string {
  if (err instanceof MoodleApiError) return err.message;
  if (err instanceof MoodleNetworkError) return err.message;
  if (err instanceof Error) return `Error inesperado: ${err.message}`;
  return 'Error desconocido al comunicarse con Moodle';
}
