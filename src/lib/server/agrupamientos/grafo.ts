// Grafo sociométrico unificado.
// Traduce los votos de una sesión a "quién eligió a quién", sea cual sea el
// formato de votación:
// - 'nominacion': cada alumno elige hasta N compañeros de TODA la lista.
//   Elegir = vínculo; no elegir = sin vínculo (dato, no ausencia de dato).
// - 'calificacion' (formato anterior): cada alumno calificó 1-5 a k compañeros
//   asignados al azar. Elegir = 4 o 5; si no lo calificó, no hay dato.
// Todo lo demás (grupos, análisis, estadísticas) trabaja sobre este grafo.

import type { VotoParsed, AlumnoRef } from './tipos.js';

export type ModoVoto = 'nominacion' | 'calificacion';

export interface Grafo {
  modo: ModoVoto;
  /** Alumnos del curso (padrón ∪ votantes ∪ elegidos), ordenados por nombre. */
  alumnos: AlumnoRef[];
  nombre: (id: number) => string;
  votantes: Set<number>;
  /** a eligió a b (vínculo positivo dirigido). */
  elige: (a: number, b: number) => boolean;
  /** Intensidad del vínculo a→b en [0, 1]; 0 si no hay vínculo o no hay dato. */
  peso: (a: number, b: number) => number;
  /** a se expresó sobre b (nominación: a votó; calificación: a calificó a b). */
  opino: (a: number, b: number) => boolean;
  /** Ids que a eligió, en el orden en que los eligió. */
  eleccionesDe: (a: number) => number[];
  /** Elecciones positivas que recibió b. */
  recibidas: (b: number) => number;
  /** Cuántos votantes pudieron elegir a b (base de comparación justa). */
  exposicion: (b: number) => number;
  /** Ids con elección recíproca con a. */
  mutuasDe: (a: number) => number[];
  /** Pares {a,b} (a<b) con elección recíproca. */
  paresMutuos: [number, number][];
  /** Pedido de no quedar juntos, en cualquier sentido. */
  bloqueado: (a: number, b: number) => boolean;
  rechazosRecibidos: (b: number) => number;
  /** Pares {a,b} bloqueados (a<b). */
  paresBloqueados: [number, number][];
}

const clave = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

export function construirGrafo(
  votos: VotoParsed[],
  roster: AlumnoRef[],
  modo: ModoVoto
): Grafo {
  const nombres = new Map<number, string>();
  for (const v of votos) {
    nombres.set(v.votanteMoodleId, v.votanteNombre);
    for (const c of v.calificaciones) if (!nombres.has(c.id)) nombres.set(c.id, c.nombre);
  }
  for (const a of roster) nombres.set(a.id, a.nombre);

  const votantes = new Set(votos.map((v) => v.votanteMoodleId));

  // a → (b → puntaje)
  const puntajes = new Map<number, Map<number, number>>();
  const orden = new Map<number, number[]>();
  for (const v of votos) {
    const m = new Map<number, number>();
    const o: number[] = [];
    for (const c of v.calificaciones) {
      if (c.id === v.votanteMoodleId || m.has(c.id)) continue;
      m.set(c.id, c.puntaje);
      if (modo === 'nominacion' || c.puntaje >= 4) o.push(c.id);
    }
    puntajes.set(v.votanteMoodleId, m);
    orden.set(v.votanteMoodleId, o);
  }

  const elige = (a: number, b: number) => {
    const p = puntajes.get(a)?.get(b);
    if (p == null) return false;
    return modo === 'nominacion' ? true : p >= 4;
  };
  const peso = (a: number, b: number) => {
    const p = puntajes.get(a)?.get(b);
    if (p == null) return 0;
    return modo === 'nominacion' ? 1 : (p - 1) / 4;
  };

  const recibidasMap = new Map<number, number>();
  const exposicionMap = new Map<number, number>();
  for (const [a, m] of puntajes) {
    for (const [b] of m) {
      if (elige(a, b)) recibidasMap.set(b, (recibidasMap.get(b) ?? 0) + 1);
      if (modo === 'calificacion') exposicionMap.set(b, (exposicionMap.get(b) ?? 0) + 1);
    }
  }
  const exposicion = (b: number) =>
    modo === 'nominacion' ? votantes.size - (votantes.has(b) ? 1 : 0) : exposicionMap.get(b) ?? 0;

  const paresMutuos: [number, number][] = [];
  const mutuas = new Map<number, number[]>();
  for (const [a, o] of orden) {
    for (const b of o) {
      if (a < b && elige(b, a)) {
        paresMutuos.push([a, b]);
        mutuas.set(a, [...(mutuas.get(a) ?? []), b]);
        mutuas.set(b, [...(mutuas.get(b) ?? []), a]);
      }
    }
  }

  const bloqueos = new Set<string>();
  const paresBloqueados: [number, number][] = [];
  const rechazos = new Map<number, number>();
  for (const v of votos) {
    const b = v.bloqueadoMoodleId;
    if (b == null || b === v.votanteMoodleId) continue;
    rechazos.set(b, (rechazos.get(b) ?? 0) + 1);
    const k = clave(v.votanteMoodleId, b);
    if (!bloqueos.has(k)) {
      bloqueos.add(k);
      paresBloqueados.push(v.votanteMoodleId < b ? [v.votanteMoodleId, b] : [b, v.votanteMoodleId]);
    }
  }

  // Si hay padrón, el curso es el padrón (+ votantes, por si alguien se dio de baja).
  const ids = new Set<number>([...roster.map((a) => a.id), ...votantes]);
  if (roster.length === 0) for (const id of nombres.keys()) ids.add(id);
  const alumnos = [...ids]
    .map((id) => ({ id, nombre: nombres.get(id) ?? `#${id}` }))
    .sort((x, y) => x.nombre.localeCompare(y.nombre, 'es'));

  return {
    modo,
    alumnos,
    nombre: (id) => nombres.get(id) ?? `#${id}`,
    votantes,
    elige,
    peso,
    opino: (a, b) =>
      a !== b && (modo === 'nominacion' ? votantes.has(a) : puntajes.get(a)?.has(b) === true),
    eleccionesDe: (a) => orden.get(a) ?? [],
    recibidas: (b) => recibidasMap.get(b) ?? 0,
    exposicion,
    mutuasDe: (a) => mutuas.get(a) ?? [],
    paresMutuos,
    bloqueado: (a, b) => bloqueos.has(clave(a, b)),
    rechazosRecibidos: (b) => rechazos.get(b) ?? 0,
    paresBloqueados
  };
}

// ─── Utilidades de reparto compartidas ───────────────────────────────────────

/** Capacidades equilibradas: N alumnos en grupos de ~tamano (difieren a lo sumo en 1). */
export function capacidades(n: number, tamano: number): number[] {
  const numGrupos = Math.max(1, Math.ceil(n / Math.max(1, tamano)));
  const base = Math.floor(n / numGrupos);
  const extra = n % numGrupos;
  return Array.from({ length: numGrupos }, (_, i) => base + (i < extra ? 1 : 0));
}

/**
 * Reparte una lista ya ordenada en "serpiente" (1,2,3…3,2,1) para que cada
 * grupo reciba de cada franja del orden. Nunca junta a dos alumnos con pedido
 * de no quedar juntos si existe algún grupo con lugar donde no choquen.
 */
export function distribuirSerpentina<T extends { id: number }>(
  ordenados: T[],
  tamano: number,
  bloqueado: (a: number, b: number) => boolean
): T[][] {
  if (ordenados.length === 0) return [];
  const caps = capacidades(ordenados.length, tamano);
  const G = caps.length;
  const grupos: T[][] = Array.from({ length: G }, () => []);
  const conflictos = (gi: number, x: T) => grupos[gi].filter((m) => bloqueado(m.id, x.id)).length;

  let g = 0;
  let dir = 1;
  const avanzar = () => {
    g += dir;
    if (g >= G) { g = G - 1; dir = -1; }
    else if (g < 0) { g = 0; dir = 1; }
  };

  for (const x of ordenados) {
    // Recorre los grupos en el orden de la serpiente desde la posición actual.
    let elegido = -1;
    let gg = g;
    let dd = dir;
    for (let k = 0; k < 2 * G && elegido < 0; k++) {
      if (grupos[gg].length < caps[gg] && conflictos(gg, x) === 0) elegido = gg;
      gg += dd;
      if (gg >= G) { gg = G - 1; dd = -1; }
      else if (gg < 0) { gg = 0; dd = 1; }
    }
    if (elegido < 0) {
      // Sin opción limpia: el grupo con lugar que menos choque (y más chico).
      let mejor = -1;
      for (let i = 0; i < G; i++) {
        if (grupos[i].length >= caps[i]) continue;
        if (
          mejor < 0 ||
          conflictos(i, x) < conflictos(mejor, x) ||
          (conflictos(i, x) === conflictos(mejor, x) && grupos[i].length < grupos[mejor].length)
        ) mejor = i;
      }
      elegido = mejor < 0 ? 0 : mejor;
    }
    grupos[elegido].push(x);
    avanzar();
  }
  return repararBloqueos(grupos.filter((gr) => gr.length > 0), bloqueado);
}

/**
 * Si quedó algún par con pedido de no estar juntos (los últimos en ubicarse
 * pueden no tener opción), intercambia a uno de ellos con alguien de otro
 * grupo siempre que baje la cantidad de choques. No toca nada más.
 */
export function repararBloqueos<T extends { id: number }>(
  grupos: T[][],
  bloqueado: (a: number, b: number) => boolean
): T[][] {
  const choques = (gr: T[]) => {
    let c = 0;
    for (let i = 0; i < gr.length; i++)
      for (let j = i + 1; j < gr.length; j++) if (bloqueado(gr[i].id, gr[j].id)) c++;
    return c;
  };
  for (let ronda = 0; ronda < 10; ronda++) {
    let cambio = false;
    for (let gi = 0; gi < grupos.length; gi++) {
      if (choques(grupos[gi]) === 0) continue;
      for (let a = 0; a < grupos[gi].length && choques(grupos[gi]) > 0; a++) {
        for (let gj = 0; gj < grupos.length; gj++) {
          if (gj === gi) continue;
          let hecho = false;
          for (let b = 0; b < grupos[gj].length; b++) {
            const antes = choques(grupos[gi]) + choques(grupos[gj]);
            const x = grupos[gi][a];
            const y = grupos[gj][b];
            grupos[gi][a] = y;
            grupos[gj][b] = x;
            if (choques(grupos[gi]) + choques(grupos[gj]) < antes) { hecho = true; cambio = true; break; }
            grupos[gi][a] = x;
            grupos[gj][b] = y;
          }
          if (hecho) break;
        }
      }
    }
    if (!cambio) break;
  }
  return grupos;
}

/**
 * Mejora local: intercambia alumnos de la MISMA franja entre grupos (así no se
 * rompe el equilibrio) para que cada uno tenga al menos un vínculo dentro de su
 * grupo, y para deshacer pedidos de no quedar juntos que hayan quedado.
 */
export function mejorarConApoyo<T extends { id: number }>(
  grupos: T[][],
  franjaDe: (id: number) => string,
  g: Grafo,
  rondas = 20
): T[][] {
  const res = grupos.map((gr) => [...gr]);
  const valor = (gr: T[]) => {
    let v = 0;
    for (const m of gr) {
      if (gr.some((x) => x.id !== m.id && (g.elige(m.id, x.id) || g.elige(x.id, m.id)))) v += 1;
    }
    for (let i = 0; i < gr.length; i++)
      for (let j = i + 1; j < gr.length; j++) if (g.bloqueado(gr[i].id, gr[j].id)) v -= 100;
    return v;
  };
  for (let r = 0; r < rondas; r++) {
    let mejoro = false;
    for (let gi = 0; gi < res.length; gi++) {
      for (let gj = gi + 1; gj < res.length; gj++) {
        for (let a = 0; a < res[gi].length; a++) {
          for (let b = 0; b < res[gj].length; b++) {
            const x = res[gi][a];
            const y = res[gj][b];
            if (franjaDe(x.id) !== franjaDe(y.id)) continue;
            const antes = valor(res[gi]) + valor(res[gj]);
            res[gi][a] = y;
            res[gj][b] = x;
            const despues = valor(res[gi]) + valor(res[gj]);
            if (despues > antes) mejoro = true;
            else { res[gi][a] = x; res[gj][b] = y; }
          }
        }
      }
    }
    if (!mejoro) break;
  }
  return res;
}

/** Barajado determinístico (misma semilla → mismo orden). */
export function barajar<T>(arr: T[], semilla: number): T[] {
  const a = [...arr];
  let t = semilla >>> 0;
  const rand = () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Grupos al azar (reproducibles por semilla) que respetan los pedidos de no quedar juntos. */
export function agruparAlAzar(g: Grafo, tamano: number, semilla: number): AlumnoRef[][] {
  return distribuirSerpentina(barajar(g.alumnos, semilla), tamano, g.bloqueado);
}
