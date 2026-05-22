import { and, gt, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';
import { usuarios, roles, sessions } from '$lib/server/db/schema.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const [usuariosRows, rolesRows, sesionesActivas] = await Promise.all([
    db.select({ id: usuarios.id, activo: usuarios.activo }).from(usuarios),
    db.select({ rol: roles.rol }).from(roles),
    db
      .select({ id: sessions.id })
      .from(sessions)
      .where(and(gt(sessions.expiresAt, new Date()), isNull(sessions.revokedAt)))
  ]);

  // Distribución de roles
  const porRol: Record<string, number> = {};
  for (const r of rolesRows) porRol[r.rol] = (porRol[r.rol] ?? 0) + 1;

  return {
    totalUsuarios: usuariosRows.length,
    usuariosActivos: usuariosRows.filter((u) => u.activo).length,
    sesionesActivas: sesionesActivas.length,
    porRol
  };
};
