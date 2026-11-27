// Servicio central de autorización.
// Toda decisión "puede X ver/modificar Y" se concentra acá.

import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../db/index.js';
import { roles, vinculosFamilia } from '../db/schema.js';
import type { RolNombre } from '../db/schema.js';

type RolConAlcance = { rol: RolNombre; scope: string | null };

export async function rolesDe(
  usuarioId: number
): Promise<RolConAlcance[]> {
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

export async function esAdmin(usuarioId: number): Promise<boolean> {
  return tieneRol(usuarioId, 'admin');
}

// El admin es superusuario: pasa todas las comprobaciones de permisos.
export async function esStaff(usuarioId: number): Promise<boolean> {
  const rs = await rolesDe(usuarioId);
  return rs.some(r =>
    r.rol === 'admin' || r.rol === 'docente' || r.rol === 'preceptor' || r.rol === 'directivo' || r.rol === 'gabinete'
  );
}

// Gabinete psicopedagógico: los casos son información clínico-pedagógica
// reservada. Solo psicopedagogas (rol "gabinete") y admin.
export async function esGabineteOAdmin(usuarioId: number): Promise<boolean> {
  const rs = await rolesDe(usuarioId);
  return rs.some(r => r.rol === 'admin' || r.rol === 'gabinete');
}

export async function puedeVerEvidenciasDeGabinete(usuarioId: number, cursoId: number): Promise<boolean> {
  if (!Number.isSafeInteger(cursoId) || cursoId <= 0) return false;
  const rs = await rolesDe(usuarioId);
  return gabineteParaCurso(rs, cursoId);
}

function gabineteParaCurso(rs: RolConAlcance[], cursoId: number): boolean {
  if (rs.some((r) => r.rol === 'admin')) return true;
  const gabinete = rs.filter((r) => r.rol === 'gabinete');
  if (!gabinete.length) return false;
  // Una asignación explícita limita el rol aunque también se conserve su fila base.
  return gabinete.every((r) => r.scope === null) || gabinete.some((r) => r.scope === alcanceCurso(cursoId));
}

export async function puedeGestionarFichaApoyo(usuarioId: number, cursoId: number): Promise<boolean> {
  if (!Number.isSafeInteger(cursoId) || cursoId <= 0) return false;
  const rs = await rolesDe(usuarioId);
  return gabineteParaCurso(rs, cursoId) || rs.some((r) => r.rol === 'docente' && r.scope === alcanceCurso(cursoId));
}

// Quiénes ven todas las sesiones de agrupamientos (no solo las propias).
export async function veTodasLasSesiones(usuarioId: number): Promise<boolean> {
  const rs = await rolesDe(usuarioId);
  return rs.some(r => r.rol === 'admin' || r.rol === 'preceptor' || r.rol === 'directivo' || r.rol === 'gabinete');
}

export async function esDirectivo(usuarioId: number): Promise<boolean> {
  return tieneRol(usuarioId, 'directivo');
}

// Roles con visión total (supervisión): ven todos los recursos institucionales.
export async function esDirectivoOAdmin(usuarioId: number): Promise<boolean> {
  const rs = await rolesDe(usuarioId);
  return rs.some(r => r.rol === 'admin' || r.rol === 'directivo');
}

export async function esPreceptor(usuarioId: number): Promise<boolean> {
  return tieneRol(usuarioId, 'preceptor');
}

export async function esPreceptorODirectivo(usuarioId: number): Promise<boolean> {
  const rs = await rolesDe(usuarioId);
  return rs.some(r => r.rol === 'admin' || r.rol === 'preceptor' || r.rol === 'directivo');
}

// Directivos / docentes / preceptores: ven cualquier alumno.
// Padres: solo sus hijos vinculados Y verificados.
export async function puedeVerAlumno(usuarioId: number, alumnoMoodleId: number): Promise<boolean> {
  const rs = await rolesDe(usuarioId);

  if (rs.some(r => r.rol === 'admin' || r.rol === 'directivo' || r.rol === 'docente' || r.rol === 'preceptor' || r.rol === 'gabinete')) {
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

export function alcanceCurso(cursoId: number): string {
  return `curso:${cursoId}`;
}

export function idCursoDeAlcance(scope: string | null): number | null {
  if (!scope || !/^curso:[1-9]\d*$/.test(scope)) return null;
  const id = Number(scope.slice(6));
  return Number.isSafeInteger(id) ? id : null;
}

function preceptorInstitucional(rs: RolConAlcance[]): boolean {
  const preceptoria = rs.filter((r) => r.rol === 'preceptor');
  // Una fila con alcance limita al rol aunque también exista la fila base.
  return preceptoria.length > 0 && preceptoria.every((r) => r.scope === null);
}

function cursosDeRoles(rs: RolConAlcance[]): number[] | null {
  if (rs.some((r) => r.rol === 'admin' || r.rol === 'directivo' || r.rol === 'gabinete')) return null;
  // Preceptoría preexistente sin asignaciones sigue trabajando a nivel institucional.
  if (preceptorInstitucional(rs)) return null;
  const ids = new Set<number>();
  for (const r of rs) {
    if (r.rol !== 'docente' && r.rol !== 'preceptor') continue;
    const id = idCursoDeAlcance(r.scope);
    if (id !== null) ids.add(id);
  }
  return [...ids];
}

export async function puedeGestionarPreceptoriaCurso(usuarioId: number, cursoId: number): Promise<boolean> {
  if (!Number.isSafeInteger(cursoId) || cursoId <= 0) return false;
  const ids = await alcancePreceptoria(usuarioId);
  return ids === null || ids.includes(cursoId);
}

export async function alcancePreceptoria(usuarioId: number): Promise<number[] | null> {
  const rs = await rolesDe(usuarioId);
  return cursosDeRoles(rs.filter((r) => r.rol === 'admin' || r.rol === 'directivo' || r.rol === 'preceptor'));
}

export async function veTodasLasSesionesDeCurso(usuarioId: number, cursoId: number): Promise<boolean> {
  if (!Number.isSafeInteger(cursoId) || cursoId <= 0) return false;
  const { cursosSupervisados } = await alcancesAgrupamientos(usuarioId);
  return cursosSupervisados === null || cursosSupervisados.includes(cursoId);
}

export async function alcancesAgrupamientos(usuarioId: number) {
  const rs = await rolesDe(usuarioId);
  return {
    cursosPermitidos: cursosDeRoles(rs),
    cursosSupervisados: cursosDeRoles(rs.filter((r) => r.rol !== 'docente'))
  };
}

/** null indica acceso institucional y [] indica que no tiene cursos asignados. */
export async function alcanceCursos(usuarioId: number): Promise<number[] | null> {
  return cursosDeRoles(await rolesDe(usuarioId));
}

export async function cursosVisiblesPara<T extends { id: number }>(usuarioId: number, cursos: T[]): Promise<T[]> {
  const alcance = await alcanceCursos(usuarioId);
  if (alcance === null) return cursos;
  const ids = new Set(alcance);
  return cursos.filter((c) => ids.has(c.id));
}

export async function puedeVerCurso(usuarioId: number, cursoMoodleId: number): Promise<boolean> {
  if (!Number.isSafeInteger(cursoMoodleId) || cursoMoodleId <= 0) return false;
  const alcance = await alcanceCursos(usuarioId);
  return alcance === null || alcance.includes(cursoMoodleId);
}

export async function puedeEvaluarCurso(usuarioId: number, cursoMoodleId: number): Promise<boolean> {
  if (!Number.isSafeInteger(cursoMoodleId) || cursoMoodleId <= 0) return false;
  const scope = alcanceCurso(cursoMoodleId);
  return (await rolesDe(usuarioId)).some((r) => r.rol === 'admin' || (r.rol === 'docente' && r.scope === scope));
}

/** Para familia, las notas requieren vínculo verificado y pertenencia al curso en la ruta. */
export async function puedeVerNotasCurso(usuarioId: number, cursoId: number, alumnoId: number): Promise<boolean> {
  if (!Number.isSafeInteger(cursoId) || cursoId <= 0) return false;
  const rs = await rolesDe(usuarioId);
  const alcance = cursosDeRoles(rs);
  if (alcance === null || alcance.includes(cursoId)) return true;
  if (!rs.some((r) => r.rol === 'padre')) return false;
  const [vinculo] = await db.select({ padreId: vinculosFamilia.padreId }).from(vinculosFamilia)
    .where(and(
      eq(vinculosFamilia.padreId, usuarioId),
      eq(vinculosFamilia.alumnoMoodleId, alumnoId),
      eq(vinculosFamilia.verificado, true)
    ))
    .limit(1);
  return !!vinculo;
}

// ─── Permisos para Faltas ────────────────────────────────────────────────────
// Preceptores y directivos pueden crear/ver/confirmar faltas.
// Docentes solo pueden VER faltas de sus cursos (visibilidad pública).
export async function puedeGestionarFaltas(usuarioId: number): Promise<boolean> {
  return esPreceptorODirectivo(usuarioId);
}

export async function puedeVerFaltas(usuarioId: number): Promise<boolean> {
  return esStaff(usuarioId);
}

// ─── Permisos para Amonestaciones ────────────────────────────────────────────
export async function puedeGestionarAmonestaciones(usuarioId: number): Promise<boolean> {
  return esPreceptorODirectivo(usuarioId);
}

export async function puedeVerAmonestaciones(usuarioId: number): Promise<boolean> {
  return esStaff(usuarioId);
}

// ─── Permisos para Reincorporaciones ─────────────────────────────────────────
export async function puedeGestionarReincorporaciones(usuarioId: number): Promise<boolean> {
  return esPreceptorODirectivo(usuarioId);
}

// ─── Permisos para Actas ─────────────────────────────────────────────────────
// Las actas son de preceptoría/dirección (las páginas viven bajo /preceptor).
// Acceder a la sección: preceptor/directivo/admin. Qué actas concretas se ven
// se decide a nivel objeto (creador/asistente vs directivo) en actas.ts.
export async function puedeCrearActa(usuarioId: number): Promise<boolean> {
  return esPreceptorODirectivo(usuarioId);
}

export async function puedeVerActas(usuarioId: number): Promise<boolean> {
  return esPreceptorODirectivo(usuarioId);
}

export async function puedeEditarActa(usuarioId: number): Promise<boolean> {
  return esPreceptorODirectivo(usuarioId);
}

// ─── Asignación de roles ──────────────────────────────────────────────────────
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
