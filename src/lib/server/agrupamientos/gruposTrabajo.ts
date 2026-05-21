// Generación de grupos heterogéneos ("equilibrados").
// Portado de `generar_grupos_para_trabajo` (algoritmo Raptor) de la app original.
// Mezcla alumnos populares con los menos elegidos para favorecer la integración.

import type { VotoParsed, AlumnoRef } from './tipos.js';
import { media, redondear } from './stats.js';

export type NivelPopularidad = 'alto' | 'medio' | 'bajo';

export interface GrupoEquilibrado {
  miembros: (AlumnoRef & { nivel: NivelPopularidad })[];
  popularidadPromedio: number;
}

/**
 * Distribuye el roster en grupos heterogéneos. Usa la popularidad recibida
 * (promedio de calificaciones) para clasificar y repartir en "serpiente",
 * de modo que cada grupo mezcle alumnos de distinta popularidad. Respeta
 * bloqueos en lo posible.
 */
export function generarGruposEquilibrados(
  votos: VotoParsed[],
  roster: AlumnoRef[],
  opciones: { tamano?: number } = {}
): GrupoEquilibrado[] {
  const tamano = opciones.tamano ?? 4;
  if (roster.length < 2) return [];

  // Popularidad recibida por alumno
  const recibidos = new Map<number, number[]>();
  for (const v of votos) {
    for (const c of v.calificaciones) {
      if (!recibidos.has(c.id)) recibidos.set(c.id, []);
      recibidos.get(c.id)!.push(c.puntaje);
    }
  }
  const popularidad = (id: number): number => {
    const p = recibidos.get(id);
    return p && p.length > 0 ? media(p) : 3.0; // neutro si no tiene votos
  };

  // Bloqueos bidireccionales
  const clave = (a: number, b: number) => `${Math.min(a, b)}-${Math.max(a, b)}`;
  const bloqueos = new Set<string>();
  for (const v of votos) {
    if (v.bloqueadoMoodleId != null) {
      bloqueos.add(clave(v.votanteMoodleId, v.bloqueadoMoodleId));
    }
  }
  const bloqueado = (a: number, b: number) => bloqueos.has(clave(a, b));

  // Ordenar por popularidad y clasificar en tercios
  const ordenados = [...roster].sort((a, b) => popularidad(b.id) - popularidad(a.id));
  const tercio = Math.floor(ordenados.length / 3) || 1;
  const nivelPorId = new Map<number, NivelPopularidad>();
  ordenados.forEach((a, i) => {
    nivelPorId.set(a.id, i < tercio ? 'alto' : i < tercio * 2 ? 'medio' : 'bajo');
  });

  // Repartir en "serpiente" para equilibrar la popularidad entre grupos
  const numGrupos = Math.max(1, Math.ceil(ordenados.length / tamano));
  const grupos: AlumnoRef[][] = Array.from({ length: numGrupos }, () => []);

  let g = 0;
  let dir = 1;
  const avanzar = () => {
    g += dir;
    if (g >= numGrupos) {
      g = numGrupos - 1;
      dir = -1;
    } else if (g < 0) {
      g = 0;
      dir = 1;
    }
  };

  for (const al of ordenados) {
    // Buscar un grupo con espacio y sin bloqueos (best-effort)
    let intentos = 0;
    while (
      intentos < numGrupos &&
      (grupos[g].length >= tamano || grupos[g].some((m) => bloqueado(m.id, al.id)))
    ) {
      avanzar();
      intentos++;
    }
    // Si todos están llenos, ubicarlo en el grupo más chico
    if (grupos[g].length >= tamano) {
      g = grupos.reduce((min, gr, i) => (gr.length < grupos[min].length ? i : min), 0);
    }
    grupos[g].push(al);
    avanzar();
  }

  return grupos
    .filter((gr) => gr.length > 0)
    .map((gr) => ({
      miembros: gr.map((m) => ({ ...m, nivel: nivelPorId.get(m.id) ?? 'medio' })),
      popularidadPromedio: redondear(media(gr.map((m) => popularidad(m.id))))
    }));
}
