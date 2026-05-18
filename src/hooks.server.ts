import { loadSession, SESSION_COOKIE_NAME } from '$lib/server/session.js';
import { initDb } from '$lib/server/db/index.js';
import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function init() {
  try {
    await initDb();
  } catch (err) {
    console.error('[legajo] Error critico al iniciar la base de datos:', err);
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  const cookie = event.cookies.get(SESSION_COOKIE_NAME);

  if (cookie) {
    try {
      event.locals.usuario = await loadSession(cookie);
    } catch (err) {
      console.error('[legajo] Error al cargar sesion:', err);
      event.locals.usuario = null;
    }

    if (!event.locals.usuario) {
      event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    }
  } else {
    event.locals.usuario = null;
  }

  const response = await resolve(event);

  // Headers de seguridad
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
};
