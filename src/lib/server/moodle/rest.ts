import { MoodleApiError, MoodleNetworkError } from './errors.js';
import type { MoodleErrorResponse } from './types.js';

type ParametrosRest = Record<string, string | number>;

export async function llamarMoodleRest<T>(
  endpoint: string,
  token: string,
  funcion: string,
  parametros: ParametrosRest = {},
  redirect: RequestRedirect = 'follow',
  timeoutMs = 10_000
): Promise<T> {
  const body = new URLSearchParams({
    wstoken: token,
    wsfunction: funcion,
    moodlewsrestformat: 'json'
  });

  for (const [campo, valor] of Object.entries(parametros)) {
    body.set(campo, String(valor));
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      redirect,
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      throw new MoodleNetworkError(`La solicitud tardó demasiado (timeout ${timeoutMs / 1000}s)`);
    }
    throw new MoodleNetworkError(err instanceof Error ? err.message : String(err));
  }

  if (!response.ok) {
    throw new MoodleNetworkError(`HTTP ${response.status} ${response.statusText}`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new MoodleNetworkError('La respuesta de Moodle no es JSON válido');
  }
  if (data && typeof data === 'object' && 'exception' in data) {
    throw new MoodleApiError(data as MoodleErrorResponse);
  }
  return data as T;
}
