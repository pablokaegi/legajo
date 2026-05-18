// Sesiones revocables en DB.
//
// La cookie del cliente lleva un id aleatorio + firma HMAC. Los datos del
// usuario NO están en la cookie — se cargan de la tabla `sessions` en cada
// request. Esto habilita logout real e invalidación selectiva.

import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from './db/index.js';
import { sessions, usuarios, roles } from './db/schema.js';
import type { RolNombre } from './db/schema.js';

const SESSION_TTL_HOURS = 8;

export interface SessionUser {
  usuarioId: number;
  email: string;
  nombre: string;
  roles: RolNombre[];
  sessionId: string;
}

function getSecret(): string {
  const secret = env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('[legajo] SESSION_SECRET no esta configurado o es demasiado corto (minimo 32 caracteres)');
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

function makeCookieValue(id: string): string {
  return `${id}.${sign(id)}`;
}

function parseCookieValue(cookie: string): string | null {
  const dotIndex = cookie.lastIndexOf('.');
  if (dotIndex === -1) return null;

  const id = cookie.substring(0, dotIndex);
  const sig = cookie.substring(dotIndex + 1);

  if (id.length !== 64 || !/^[0-9a-f]+$/.test(id)) return null;

  const expected = sign(id);
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  return id;
}

export async function createSession(
  usuarioId: number,
  meta: { ip?: string; userAgent?: string } = {}
): Promise<{ cookieValue: string; expiresAt: Date }> {
  const id = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);

  await db.insert(sessions).values({
    id,
    usuarioId,
    expiresAt,
    ipAddress: meta.ip ?? null,
    userAgent: meta.userAgent ? meta.userAgent.slice(0, 255) : null
  });

  return { cookieValue: makeCookieValue(id), expiresAt };
}

export async function loadSession(cookie: string): Promise<SessionUser | null> {
  const id = parseCookieValue(cookie);
  if (!id) return null;

  const result = await db
    .select({
      sessionId: sessions.id,
      usuarioId: usuarios.id,
      email: usuarios.email,
      nombre: usuarios.nombre,
      activo: usuarios.activo
    })
    .from(sessions)
    .innerJoin(usuarios, eq(usuarios.id, sessions.usuarioId))
    .where(and(
      eq(sessions.id, id),
      gt(sessions.expiresAt, new Date()),
      isNull(sessions.revokedAt)
    ))
    .limit(1);

  const row = result[0];
  if (!row || !row.activo) return null;

  const rolesRows = await db
    .select({ rol: roles.rol })
    .from(roles)
    .where(eq(roles.usuarioId, row.usuarioId));

  return {
    sessionId: row.sessionId,
    usuarioId: row.usuarioId,
    email: row.email,
    nombre: row.nombre,
    roles: rolesRows.map(r => r.rol as RolNombre)
  };
}

export async function revokeSession(id: string): Promise<void> {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.id, id), isNull(sessions.revokedAt)));
}

export async function revokeAllSessionsFor(usuarioId: number): Promise<void> {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.usuarioId, usuarioId), isNull(sessions.revokedAt)));
}

export const SESSION_COOKIE_NAME = 'legajo_session';
export const SESSION_TTL_SECONDS = SESSION_TTL_HOURS * 60 * 60;
