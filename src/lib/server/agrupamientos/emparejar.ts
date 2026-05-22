// Emparejamiento automático por afinidad mutua.
// Portado de `generar_emparejamientos` de la app Flask original (corrigiendo
// el bug del original, que leía 'ratings' cuando la BD guardaba 'calificaciones').

import type { VotoParsed, AlumnoRef } from './tipos.js';
import { media, redondear } from './stats.js';

export interface GrupoEmparejado {
  miembros: AlumnoRef[];
  /** Promedio de las calificaciones internas del grupo (0-5). */
  afinidadPromedio: number;
}

interface OpcionesEmparejar {
  tamanoMax?: number;     // tamaño máximo de grupo (default 4)
  umbralPareja?: number;  // afinidad mínima para formar pareja inicial (default 3.5)
  umbralGrupo?: number;   // afinidad mínima para sumarse a un grupo (default 3.0)
  umbralResto?: number;   // afinidad mínima para emparejar a los restantes (default 2.5)
}

/**
 * Forma grupos priorizando afinidades mutuas y evitando bloqueos.
 * Sigue las 10 fases del algoritmo greedy original.
 *
 * @param votos  votos cargados de la sesión
 * @param roster lista completa del curso (para sumar a los que no votaron)
 */
export function generarEmparejamientos(
  votos: VotoParsed[],
  roster: AlumnoRef[] = [],
  opciones: OpcionesEmparejar = {}
): GrupoEmparejado[] {
  const tamanoMax    = opciones.tamanoMax ?? 4;
  const umbralPareja = opciones.umbralPareja ?? 3.5;
  const umbralGrupo  = opciones.umbralGrupo ?? 3.0;
  const umbralResto  = opciones.umbralResto ?? 2.5;

  if (votos.length === 0) {
    return roster.map((a) => ({ miembros: [a], afinidadPromedio: 0 }));
  }

  const porVotante = new Map<number, VotoParsed>();
  const nombrePorId = new Map<number, string>();
  for (const v of votos) {
    porVotante.set(v.votanteMoodleId, v);
    nombrePorId.set(v.votanteMoodleId, v.votanteNombre);
    for (const c of v.calificaciones) nombrePorId.set(c.id, c.nombre);
  }
  for (const a of roster) nombrePorId.set(a.id, a.nombre);

  const rating = (a: number, b: number): number | null => {
    const v = porVotante.get(a);
    if (!v) return null;
    const c = v.calificaciones.find((x) => x.id === b);
    return c ? c.puntaje : null;
  };

  // Bloqueos bidireccionales
  const claveBloqueo = (a: number, b: number) => `${Math.min(a, b)}-${Math.max(a, b)}`;
  const bloqueos = new Set<string>();
  for (const v of votos) {
    if (v.bloqueadoMoodleId != null) {
      bloqueos.add(claveBloqueo(v.votanteMoodleId, v.bloqueadoMoodleId));
    }
  }
  const estaBloqueado = (a: number, b: number) => bloqueos.has(claveBloqueo(a, b));

  // 1. Afinidades mutuas (ambos se calificaron entre sí)
  interface Afinidad { a: number; b: number; promedio: number; diferencia: number; }
  const afinidades: Afinidad[] = [];
  const paresVistos = new Set<string>();
  for (const v of votos) {
    const a = v.votanteMoodleId;
    for (const c of v.calificaciones) {
      const b = c.id;
      if (!porVotante.has(b)) continue;
      const clave = claveBloqueo(a, b);
      if (paresVistos.has(clave)) continue;
      const r1 = rating(a, b);
      const r2 = rating(b, a);
      if (r1 == null || r2 == null) continue;
      paresVistos.add(clave);
      afinidades.push({ a, b, promedio: (r1 + r2) / 2, diferencia: Math.abs(r1 - r2) });
    }
  }

  // 2-3. Filtrar bloqueadas y ordenar por mejor afinidad
  const ordenadas = afinidades
    .filter((af) => !estaBloqueado(af.a, af.b))
    .sort((x, y) => y.promedio - x.promedio || x.diferencia - y.diferencia);

  const grupos: number[][] = [];
  const asignados = new Set<number>();

  // 4. Parejas de alta afinidad (>= umbralPareja)
  for (const af of ordenadas) {
    if (asignados.has(af.a) || asignados.has(af.b)) continue;
    if (af.promedio >= umbralPareja) {
      grupos.push([af.a, af.b]);
      asignados.add(af.a);
      asignados.add(af.b);
    }
  }

  // 5. Expandir grupos con alumnos sueltos (max tamanoMax, >= umbralGrupo)
  for (const v of votos) {
    const x = v.votanteMoodleId;
    if (asignados.has(x)) continue;
    let mejorIdx = -1;
    let mejorPunt = 0;
    grupos.forEach((g, i) => {
      if (g.length >= tamanoMax) return;
      if (g.some((m) => estaBloqueado(x, m))) return;
      const puntos: number[] = [];
      for (const m of g) {
        const r = rating(x, m);
        if (r != null) puntos.push(r);
      }
      if (puntos.length === 0) return;
      const prom = media(puntos);
      if (prom > mejorPunt && prom >= umbralGrupo) {
        mejorPunt = prom;
        mejorIdx = i;
      }
    });
    if (mejorIdx >= 0) {
      grupos[mejorIdx].push(x);
      asignados.add(x);
    }
  }

  // 6. Emparejar a los votantes restantes por afinidad mutua (>= umbralResto)
  const sinGrupo = votos.map((v) => v.votanteMoodleId).filter((id) => !asignados.has(id));
  let i = 0;
  while (i < sinGrupo.length - 1) {
    const a = sinGrupo[i];
    let mejorJ = -1;
    let mejorAf = 0;
    for (let j = i + 1; j < sinGrupo.length; j++) {
      const b = sinGrupo[j];
      if (estaBloqueado(a, b)) continue;
      const r1 = rating(a, b);
      const r2 = rating(b, a);
      if (r1 != null && r2 != null) {
        const af = (r1 + r2) / 2;
        if (af > mejorAf) {
          mejorAf = af;
          mejorJ = j;
        }
      }
    }
    if (mejorJ >= 0 && mejorAf >= umbralResto) {
      const b = sinGrupo[mejorJ];
      grupos.push([a, b]);
      asignados.add(a);
      asignados.add(b);
      sinGrupo.splice(mejorJ, 1);
      sinGrupo.splice(i, 1);
    } else {
      i++;
    }
  }

  // 7. Votantes sueltos restantes → grupo individual
  for (const id of sinGrupo) {
    if (!asignados.has(id)) {
      grupos.push([id]);
      asignados.add(id);
    }
  }

  // 8. Alumnos del curso que no votaron → grupo individual
  for (const a of roster) {
    if (!porVotante.has(a.id) && !asignados.has(a.id)) {
      grupos.push([a.id]);
      asignados.add(a.id);
    }
  }

  // 9-10. Ordenar por tamaño (más grandes primero) y construir resultado
  grupos.sort((a, b) => b.length - a.length);

  return grupos.map((g) => {
    const internos: number[] = [];
    for (const m1 of g) {
      for (const m2 of g) {
        if (m1 === m2) continue;
        const r = rating(m1, m2);
        if (r != null) internos.push(r);
      }
    }
    return {
      miembros: g.map((id) => ({ id, nombre: nombrePorId.get(id) ?? `#${id}` })),
      afinidadPromedio: redondear(media(internos))
    };
  });
}
