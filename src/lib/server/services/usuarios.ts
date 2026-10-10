// Gestión de cuentas (solo admin): alta con PIN inicial, roles, reset de PIN
// y activación. Los PIN se guardan con bcrypt; nunca se leen ni se loguean.

import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { usuarios, roles, sessions } from '../db/schema.js';
import type { RolNombre } from '../db/schema.js';
import { hashPin } from './auth.js';

/** Roles que se administran desde la pantalla (el de familia va por vínculos). */
export const ROLES_GESTIONABLES: RolNombre[] = ['admin', 'directivo', 'preceptor', 'docente', 'gabinete'];

export const PIN_VALIDO = /^\d{6,8}$/;
export const EMAIL_VALIDO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function listarUsuariosConRoles() {
  const [us, rs] = await Promise.all([
    db
      .select({ id: usuarios.id, nombre: usuarios.nombre, email: usuarios.email, activo: usuarios.activo })
      .from(usuarios)
      .orderBy(usuarios.nombre),
    db.select({ usuarioId: roles.usuarioId, rol: roles.rol }).from(roles)
  ]);
  return us.map((u) => ({
    ...u,
    roles: [...new Set(rs.filter((r) => r.usuarioId === u.id).map((r) => r.rol as RolNombre))]
  }));
}

export async function crearUsuario(data: {
  nombre: string;
  email: string;
  pin: string;
  roles: RolNombre[];
}): Promise<number> {
  const pinHash = await hashPin(data.pin);
  const [res] = await db.insert(usuarios).values({
    nombre: data.nombre,
    email: data.email.toLowerCase(),
    pinHash,
    activo: true
  });
  const id = Number((res as { insertId: number }).insertId);
  if (data.roles.length > 0) {
    await db.insert(roles).values(data.roles.map((rol) => ({ usuarioId: id, rol, scope: null })));
  }
  return id;
}

/** Deja exactamente esos roles (de los gestionables); no toca otros roles. */
export async function actualizarRoles(usuarioId: number, nuevos: RolNombre[]) {
  const actuales = await db
    .select({ rol: roles.rol })
    .from(roles)
    .where(eq(roles.usuarioId, usuarioId));
  const tiene = new Set(actuales.map((r) => r.rol));
  const quitar = ROLES_GESTIONABLES.filter((r) => tiene.has(r) && !nuevos.includes(r));
  const agregar = nuevos.filter((r) => !tiene.has(r));
  if (quitar.length > 0) {
    await db.delete(roles).where(and(eq(roles.usuarioId, usuarioId), inArray(roles.rol, quitar)));
  }
  if (agregar.length > 0) {
    await db.insert(roles).values(agregar.map((rol) => ({ usuarioId, rol, scope: null })));
  }
  return { quitar, agregar };
}

export async function resetearPin(usuarioId: number, pin: string) {
  await db.update(usuarios).set({ pinHash: await hashPin(pin) }).where(eq(usuarios.id, usuarioId));
  // Cerrar las sesiones abiertas: el PIN viejo no debe seguir dando acceso.
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.usuarioId, usuarioId));
}

export async function cambiarActivo(usuarioId: number, activo: boolean) {
  await db.update(usuarios).set({ activo }).where(eq(usuarios.id, usuarioId));
  if (!activo) {
    await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.usuarioId, usuarioId));
  }
}
