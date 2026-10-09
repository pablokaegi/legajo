// Estadísticas descriptivas de la votación (sobre el grafo unificado).

import type { AlumnoRef, VotoParsed } from './tipos.js';
import type { Grafo } from './grafo.js';
import { redondear } from './stats.js';

export interface Estadisticas {
  modo: Grafo['modo'];
  totalVotantes: number;
  totalCurso: number;
  participacion: number;          // % del curso que votó
  totalElecciones: number;        // elecciones positivas hechas
  totalBloqueos: number;
  /** Nominación: cuántos alumnos recibieron 0, 1, 2… elecciones. Calificación: puntajes 1-5. */
  distribucion: { etiqueta: string; cantidad: number }[];
  masElegidos: { id: number; nombre: string; recibidas: number; exposicion: number }[];
  masBloqueados: { id: number; nombre: string; cantidad: number }[];
  bloqueosMutuos: { a: AlumnoRef; b: AlumnoRef }[];
  mutuas: { a: AlumnoRef; b: AlumnoRef }[];
}

export function calcularEstadisticas(g: Grafo, votos: VotoParsed[]): Estadisticas | null {
  if (g.votantes.size === 0) return null;
  const ref = (id: number): AlumnoRef => ({ id, nombre: g.nombre(id) });

  let totalElecciones = 0;
  for (const a of g.votantes) totalElecciones += g.eleccionesDe(a).length;

  let distribucion: Estadisticas['distribucion'];
  if (g.modo === 'nominacion') {
    const hist = new Map<number, number>();
    for (const a of g.alumnos) {
      const k = Math.min(g.recibidas(a.id), 5);
      hist.set(k, (hist.get(k) ?? 0) + 1);
    }
    distribucion = [0, 1, 2, 3, 4, 5].map((k) => ({
      etiqueta: k === 5 ? '5 o más' : k === 1 ? '1 elección' : `${k} elecciones`,
      cantidad: hist.get(k) ?? 0
    }));
  } else {
    const hist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const v of votos) for (const c of v.calificaciones) hist[c.puntaje] = (hist[c.puntaje] ?? 0) + 1;
    distribucion = [5, 4, 3, 2, 1].map((p) => ({ etiqueta: `Puntaje ${p}`, cantidad: hist[p] }));
  }

  const masElegidos = g.alumnos
    .map((a) => ({ id: a.id, nombre: a.nombre, recibidas: g.recibidas(a.id), exposicion: g.exposicion(a.id) }))
    .filter((x) => x.recibidas > 0)
    .sort((x, y) => y.recibidas - x.recibidas || x.nombre.localeCompare(y.nombre, 'es'));

  const masBloqueados = g.alumnos
    .map((a) => ({ id: a.id, nombre: a.nombre, cantidad: g.rechazosRecibidos(a.id) }))
    .filter((x) => x.cantidad > 0)
    .sort((x, y) => y.cantidad - x.cantidad);

  // Bloqueo mutuo: A pidió no estar con B y B pidió no estar con A.
  const pidio = new Map<number, number>();
  for (const v of votos) if (v.bloqueadoMoodleId != null) pidio.set(v.votanteMoodleId, v.bloqueadoMoodleId);
  const bloqueosMutuos = g.paresBloqueados
    .filter(([a, b]) => pidio.get(a) === b && pidio.get(b) === a)
    .map(([a, b]) => ({ a: ref(a), b: ref(b) }));

  const totalCurso = g.alumnos.length;
  return {
    modo: g.modo,
    totalVotantes: g.votantes.size,
    totalCurso,
    participacion: totalCurso > 0 ? redondear((g.votantes.size / totalCurso) * 100, 1) : 0,
    totalElecciones,
    totalBloqueos: pidio.size,
    distribucion,
    masElegidos,
    masBloqueados,
    bloqueosMutuos,
    mutuas: g.paresMutuos.map(([a, b]) => ({ a: ref(a), b: ref(b) }))
  };
}
