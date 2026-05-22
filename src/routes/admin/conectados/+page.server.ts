import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';
import { sessions, usuarios } from '$lib/server/db/schema.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const rows = await db
    .select({
      sessionId: sessions.id,
      createdAt: sessions.createdAt,
      expiresAt: sessions.expiresAt,
      revokedAt: sessions.revokedAt,
      ip: sessions.ipAddress,
      userAgent: sessions.userAgent,
      nombre: usuarios.nombre,
      email: usuarios.email
    })
    .from(sessions)
    .innerJoin(usuarios, eq(usuarios.id, sessions.usuarioId))
    .orderBy(desc(sessions.createdAt))
    .limit(60);

  const ahora = Date.now();
  const conexiones = rows.map((r) => ({
    createdAt: r.createdAt,
    ip: r.ip,
    userAgent: r.userAgent,
    nombre: r.nombre,
    email: r.email,
    activa: !r.revokedAt && new Date(r.expiresAt).getTime() > ahora
  }));

  return { conexiones };
};
