import { env } from '$env/dynamic/private';
import { comprobarDemoAlojada } from '../demo-alojada.js';

export function aulaPilotoHabilitada(): boolean {
  if (env.MOODLE_AULA_HABILITADO !== '1' || !env.DATABASE_URL) return false;
  try {
    if (env.LEGAJO_DEMO_ALOJADA === '1') {
      comprobarDemoAlojada(env);
      return true;
    }
    const db = new URL(env.DATABASE_URL);
    // El piloto solo puede almacenar registros en la base ficticia local.
    return db.protocol === 'mysql:' && ['127.0.0.1', 'localhost', '[::1]'].includes(db.hostname) &&
      db.pathname === '/legajo_aula_test';
  } catch {
    return false;
  }
}

export function destinoCuestionarioCiencias() {
  if (!aulaPilotoHabilitada() || !env.MOODLE_AULA_QUIZ_TOKEN?.trim()) return null;
  const cursoId = Number(env.MOODLE_AULA_CURSO_ID);
  const quizId = Number(env.MOODLE_AULA_QUIZ_ID);
  if (!Number.isSafeInteger(cursoId) || cursoId <= 0 || !Number.isSafeInteger(quizId) || quizId <= 0) return null;
  return { cursoId, quizId };
}
