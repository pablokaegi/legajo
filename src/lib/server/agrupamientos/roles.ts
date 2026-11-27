// Roles rotativos dentro de cada grupo — Instrucción Compleja (Cohen & Lotan,
// "Designing Groupwork"): repartir roles con responsabilidades reales y dar los
// de mayor visibilidad (coordinar, presentar) a quienes el grupo menos
// reconoce sube su estatus. Los roles rotan: nadie repite el mismo seguido.

import type { AlumnoRef } from './tipos.js';

export type RolId =
  | 'coordinacion' | 'relatoria' | 'registro' | 'materiales' | 'tiempo' | 'apoyo'
  | 'tutor' | 'tutorado' | 'par';

export interface Rol {
  id: RolId;
  nombre: string;
  descripcion: string;
  /** Rol de alta visibilidad (sube el estatus de quien lo ejerce). */
  alto: boolean;
}

export const ROLES: Rol[] = [
  { id: 'coordinacion', nombre: 'Coordinación', alto: true,
    descripcion: 'Organiza la tarea, se asegura de que todos participen y es quien consulta al docente.' },
  { id: 'relatoria', nombre: 'Relatoría', alto: true,
    descripcion: 'Presenta el trabajo del grupo frente a la clase.' },
  { id: 'registro', nombre: 'Registro', alto: false,
    descripcion: 'Anota las ideas y los acuerdos del grupo.' },
  { id: 'materiales', nombre: 'Materiales', alto: false,
    descripcion: 'Consigue, reparte y cuida los materiales.' },
  { id: 'tiempo', nombre: 'Tiempo y armonía', alto: false,
    descripcion: 'Cuida los tiempos y que todos se escuchen con respeto.' }
];
const APOYO: Rol = { id: 'apoyo', nombre: 'Apoyo', alto: false, descripcion: 'Colabora con el rol que más lo necesite.' };

/** Papeles de la tutoría entre pares (conviene alternarlos en parte de la actividad). */
export const ROLES_TUTORIA: Rol[] = [
  { id: 'tutor', nombre: 'Tutor/a', alto: true, descripcion: 'Explica, pregunta y acompaña sin resolver por el otro.' },
  { id: 'tutorado', nombre: 'Tutorado/a', alto: false, descripcion: 'Practica en voz alta, pregunta y corrige con ayuda.' },
  { id: 'par', nombre: 'Par', alto: false, descripcion: 'Sin nota cargada: el docente define quién tutorea.' }
];

export const ROL_POR_ID = new Map<string, Rol>([...ROLES, APOYO, ...ROLES_TUTORIA].map((r) => [r.id, r]));

export interface ContextoRoles {
  /** Alumnos a los que conviene subir el estatus (análisis: "para acompañar"). */
  acompanar: Set<number>;
  /** Alumnos muy elegidos: ceden los roles visibles a otros. */
  referentes: Set<number>;
  /** Roles recientes de cada alumno en el curso (el más reciente primero). */
  previos: Map<number, RolId[]>;
}

function costo(id: number, rol: Rol, ctx: ContextoRoles): number {
  let c = 0;
  if (rol.alto && ctx.acompanar.has(id)) c -= 4;
  if (rol.alto && ctx.referentes.has(id)) c += 1;
  const previos = ctx.previos.get(id) ?? [];
  previos.slice(0, 3).forEach((p, i) => {
    if (p === rol.id) c += 3 - i; // repetir el mismo rol hace poco cuesta más
  });
  if (rol.alto && previos[0] && ROL_POR_ID.get(previos[0])?.alto) c += 1; // rotar los visibles
  return c;
}

function permutaciones(n: number): number[][] {
  if (n === 0) return [[]];
  const res: number[][] = [];
  for (const p of permutaciones(n - 1)) {
    for (let i = 0; i <= p.length; i++) res.push([...p.slice(0, i), n - 1, ...p.slice(i)]);
  }
  return res;
}
const PERMS = new Map<number, number[][]>();
const permsDe = (n: number) => {
  if (!PERMS.has(n)) PERMS.set(n, permutaciones(n));
  return PERMS.get(n)!;
};

/** Asigna un rol a cada miembro de cada grupo (determinístico). */
export function asignarRoles<T extends AlumnoRef>(
  grupos: T[][],
  ctx: ContextoRoles
): (T & { rol: RolId })[][] {
  return grupos.map((gr) => {
    const k = gr.length;
    if (k === 0) return [];
    if (k > 7) return gr.map((m, i) => ({ ...m, rol: (ROLES[i]?.id ?? 'apoyo') as RolId }));
    const roles = Array.from({ length: k }, (_, i) => ROLES[i] ?? APOYO);
    let mejor: number[] = [];
    let mejorCosto = Infinity;
    for (const p of permsDe(k)) {
      // p[i] = índice del rol para el miembro i
      let c = 0;
      for (let i = 0; i < k; i++) c += costo(gr[i].id, roles[p[i]], ctx);
      if (c < mejorCosto) { mejorCosto = c; mejor = p; }
    }
    return gr.map((m, i) => ({ ...m, rol: roles[mejor[i]].id }));
  });
}
