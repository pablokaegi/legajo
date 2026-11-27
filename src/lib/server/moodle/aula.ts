import { env } from '$env/dynamic/private';
import { crearMoodleAulaConEntorno } from './aula-api.js';

export type { NotaMoodleAula, TareaMoodleAula } from './aula-api.js';

export function crearMoodleAula() {
  return crearMoodleAulaConEntorno(env);
}
