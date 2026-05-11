import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

export interface SessionData {
  docenteId: number;
  email: string;
  nombre: string;
}

function getSecret(): string {
  const secret = env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('[legajo] SESSION_SECRET no está configurado o es demasiado corto (mínimo 32 caracteres)');
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function encodeSession(data: SessionData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function decodeSession(cookie: string): SessionData | null {
  const dotIndex = cookie.lastIndexOf('.');
  if (dotIndex === -1) return null;

  const payload = cookie.substring(0, dotIndex);
  const sig = cookie.substring(dotIndex + 1);

  // Comparación en tiempo constante para prevenir timing attacks
  const expected = sign(payload);
  const expectedBuf = Buffer.from(expected);
  const sigBuf = Buffer.from(sig);

  if (expectedBuf.length !== sigBuf.length) return null;
  if (!timingSafeEqual(expectedBuf, sigBuf)) return null;

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as SessionData;
  } catch {
    return null;
  }
}
