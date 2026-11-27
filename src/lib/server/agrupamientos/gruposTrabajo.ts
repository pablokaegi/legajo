// Generación de grupos heterogéneos ("equilibrados").
// Mezcla en cada grupo alumnos muy elegidos con los menos elegidos para
// favorecer la integración (Instrucción Compleja, Cohen & Lotan), y después
// intercambia alumnos de la misma franja para que cada uno tenga al menos un
// vínculo dentro de su grupo. Nunca junta a quienes pidieron no estar juntos
// si hay alternativa.

import type { AlumnoRef } from './tipos.js';
import { mediana, redondear } from './stats.js';
import { distribuirSerpentina, mejorarConApoyo, type Grafo } from './grafo.js';

export type NivelPopularidad = 'alto' | 'medio' | 'bajo';

export interface GrupoEquilibrado {
  miembros: (AlumnoRef & { nivel: NivelPopularidad })[];
  /** Proporción media de elecciones recibidas (0-1) de los miembros. */
  estatusPromedio: number;
  sinVinculo: number;
}

/** Proporción de elecciones recibidas sobre las posibles; null si no hay base. */
export function tasaEleccion(g: Grafo, id: number): number | null {
  const e = g.exposicion(id);
  return e > 0 ? g.recibidas(id) / e : null;
}

export function generarGruposEquilibrados(
  g: Grafo,
  opciones: { tamano?: number } = {}
): GrupoEquilibrado[] {
  const tamano = Math.max(2, Math.min(6, opciones.tamano ?? 4));
  if (g.alumnos.length < 2) return [];

  const conBase = g.alumnos.map((a) => tasaEleccion(g, a.id)).filter((t): t is number => t != null);
  const neutro = conBase.length ? mediana(conBase) : 0;
  const estatus = (id: number) => tasaEleccion(g, id) ?? neutro;

  const ordenados = [...g.alumnos].sort((a, b) => estatus(b.id) - estatus(a.id) || a.id - b.id);
  const tercio = Math.max(1, Math.floor(ordenados.length / 3));
  const nivelPorId = new Map<number, NivelPopularidad>();
  ordenados.forEach((a, i) => {
    nivelPorId.set(a.id, i < tercio ? 'alto' : i < tercio * 2 ? 'medio' : 'bajo');
  });
  const nivel = (id: number) => nivelPorId.get(id) ?? 'medio';

  const repartidos = distribuirSerpentina(ordenados, tamano, g.bloqueado);
  const grupos = mejorarConApoyo(repartidos, nivel, g);

  return grupos.map((gr) => ({
    miembros: gr.map((m) => ({ ...m, nivel: nivel(m.id) })),
    estatusPromedio: redondear(gr.reduce((s, m) => s + estatus(m.id), 0) / gr.length),
    sinVinculo: gr.filter(
      (m) => !gr.some((x) => x.id !== m.id && (g.elige(m.id, x.id) || g.elige(x.id, m.id)))
    ).length
  }));
}
