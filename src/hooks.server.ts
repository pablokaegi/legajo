import { decodeSession } from '$lib/server/session.js';
import { initDb } from '$lib/server/db/index.js';
import type { Handle } from '@sveltejs/kit';

export async function init() {
  try {
    await initDb();
  } catch (err) {
    console.error('[legajo] Error crítico al iniciar la base de datos:', err);
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  const cookie = event.cookies.get('legajo_session');

  if (cookie) {
    const session = decodeSession(cookie);
    event.locals.docente = session;
  } else {
    event.locals.docente = null;
  }

  return resolve(event);
};
