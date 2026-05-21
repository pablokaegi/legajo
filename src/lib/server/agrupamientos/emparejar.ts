// Emparejamiento automático por afinidad mutua.
// Portado de `generar_emparejamientos` de la app Flask original.

import type { VotoParsed, AlumnoRef } from './tipos.js';
import { media, redondear } from './stats.js';

export interface GrupoEmparejado {
  miembros: AlumnoRef[];
  /** Promedio de las calificaciones internas del grupo (0-5). */
  afinidadPromedio: number;
}

interface OpcionesEmparejar {
  tamanoMax?: number;     // tamaño máximo de grupo
  umbralPareja?: number;  // afinidad mínima para formar pareja inicial
  umbralGrupo?: number;   // afinidad mínima para sumarse a un grupo existente
}

/**
 * Forma grupos priorizando afinidades altas y evitando bloqueos.
 * Estrategia greedy en 3 fases: parejas fuertes → expansión → restantes.
 */
export function generarEmparejamientos(
  votos: VotoParsed[],
  opciones: OpcionesEmparejar = {}
): GrupoEmparejado[] {
  const tamanoMax    = opciones.tamanoMax ?? 4;
  const umbralPareja = opciones.umbralPareja ?? 3.5;
  const umbralGrupo  = opciones.umbralGrupo ?? 3.0;

  if (votos.length === 0) return [];

  // Indexar votos y nombres
  const porVotante = new Map<number, VotoParsed>();
  const nombrePorId = new Map<number, string>();
  for (const v of votos) {
    porVotante.set(v.votanteMoodleId, v);
    nombrePorId.set(v.votanteMoodleId, v.votanteNombre);
    for (const c of v.calificaciones) nombrePorId.set(c.id, c.nombre);
  }

  // Calificación que `a` le dio a `b` (o null)
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

  // Filtrar bloqueados y ordenar por mejor afinidad
  const ordenadas = afinidades
    .filter((af) => !estaBloqueado(af.a, af.b))
    .sort((x, y) => y.promedio - x.promedio || x.diferencia - y.diferencia);

  const grupos: number[][] = [];
  const asignados = new Set<number>();

  // Fase 1: parejas de alta afinidad
  for (const af of ordenadas) {
    if (asignados.has(af.a) || asignados.has(af.b)) continue;
    if (af.promedio >= umbralPareja) {
      grupos.push([af.a, af.b]);
      asignados.add(af.a);
      asignados.add(af.b);
    }
  }

  // Fase 2: expandir grupos con alumnos sueltos
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

  // Fase 3: emparejar de a pares a los alumnos restantes
  const sueltos = votos.map((v) => v.votanteMoodleId).filter((id) => !asignados.has(id));
  while (sueltos.length > 1) {
    const a = sueltos.shift()!;
    let mejorJ = -1;
    let mejorAf = -1;
    for (let j = 0; j < sueltos.length; j++) {
      const b = sueltos[j];
      if (estaBloqueado(a, b)) continue;
      const af = ((rating(a, b) ?? 0) + (rating(b, a) ?? 0)) / 2;
      if (af > mejorAf) {
        mejorAf = af;
        mejorJ = j;
      }
    }
    if (mejorJ >= 0) {
      const b = sueltos.splice(mejorJ, 1)[0];
      grupos.push([a, b]);
      asignados.add(a);
      asignados.add(b);
    } else {
      grupos.push([a]);
      asignados.add(a);
    }
  }
  if (sueltos.length === 1) grupos.push([sueltos[0]]);

  // Construir resultado con nombres y afinidad interna
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
