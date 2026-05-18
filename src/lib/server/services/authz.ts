// Servicio central de autorización.
// Toda decisión "puede X ver/modificar Y" se concentra acá para evitar lógica
// dispersa en routes. Si una regla cambia (ej. preceptores ven solo su curso),
// se modifica en un único lugar.

import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../db/index.js';
import { roles, vinculosFamilia } from '../db/schema.js';
import type { RolNombre } from '../db/schema.js';

export async function rolesDe(
  usuarioId: number
): Promise<Array<{ rol: RolNombre; scope: string | null }>> {
  const rows = await db
    .select({ rol: roles.rol, scope: roles.scope })
    .from(roles)
    .where(eq(roles.usuarioId, usuarioId));
  return rows.map(r => ({ rol: r.rol as RolNombre, scope: r.scope }));
}

export async function tieneRol(usuarioId: number, rol: RolNombre): Promise<boolean> {
  const rs = await rolesDe(usuarioId);
  return rs.some(r => r.rol === rol);
}

export async function esStaff(usuarioId: number): Promise<boolean> {
  const rs = await rolesDe(usuarioId);
  return rs.some(r => r.rol === 'docente' || r.rol === 'preceptor' || r.rol === 'directivo');
}

export async function esDirectivo(usuarioId: number): Promise<boolean> {
  return tieneRol(usuarioId, 'directivo');
}

// Directivos / docentes / preceptores: ven cualquier alumno.
// Padres: solo sus hijos vinculados Y verificados.
export async function puedeVerAlumno(usuarioId: number, alumnoMoodleId: number): Promise<boolean> {
  const rs = await rolesDe(usuarioId);

  if (rs.some(r => r.rol === 'directivo' || r.rol === 'docente' || r.rol === 'preceptor')) {
    return true;
  }

  if (rs.some(r => r.rol === 'padre')) {
    const [v] = await db
      .select()
      .from(vinculosFamilia)
      .where(and(
        eq(vinculosFamilia.padreId, usuarioId),
        eq(vinculosFamilia.alumnoMoodleId, alumnoMoodleId),
        eq(vinculosFamilia.verificado, true)
      ))
      .limit(1);
    return !!v;
  }

  return false;
}

export async function puedeCrearObservacion(usuarioId: number): Promise<boolean> {
  return esStaff(usuarioId);
}

export async function puedeVerCurso(usuarioId: number, _cursoMoodleId: number): Promise<boolean> {
  return esStaff(usuarioId);
}

export async function asignarRol(
  usuarioId: number,
  rol: RolNombre,
  scope: string | null = null
): Promise<void> {
  await db
    .insert(roles)
    .values({ usuarioId, rol, scope })
    .onDuplicateKeyUpdate({ set: { rol } });
}

export async function revocarRol(
  usuarioId: number,
  rol: RolNombre,
  scope: string | null = null
): Promise<void> {
  if (scope === null) {
    await db.delete(roles).where(and(
      eq(roles.usuarioId, usuarioId),
      eq(roles.rol, rol),
      isNull(roles.scope)
    ));
  } else {
    await db.delete(roles).where(and(
      eq(roles.usuarioId, usuarioId),
      eq(roles.rol, rol),
      eq(roles.scope, scope)
    ));
  }
}
