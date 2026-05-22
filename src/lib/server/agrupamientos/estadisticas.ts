// Estadísticas de la votación.
// Portado de la ruta `/estadisticas` y de estadisticas.py de la app original.

import type { VotoParsed, AlumnoRef } from './tipos.js';
import { media, desviacion, redondear } from './stats.js';

export interface EstadAlumno {
  id: number;
  nombre: string;
  promedio: number;
  totalVotos: number;
  suma: number;
  max: number;
  min: number;
  desviacion: number;
}

export interface AfinidadMutua {
  a: AlumnoRef;
  b: AlumnoRef;
  puntaje1: number;
  puntaje2: number;
  promedio: number;
  diferencia: number;
}

export interface Estadisticas {
  totalVotantes: number;
  totalRatings: number;
  totalBloqueos: number;
  participacion: number;             // % del curso que votó
  distribucion: Record<number, number>; // puntaje (1-5) → cantidad
  populares: EstadAlumno[];          // ordenados de mejor a peor valorados
  masBloqueados: { id: number; nombre: string; cantidad: number }[];
  bloqueosMutuos: { a: AlumnoRef; b: AlumnoRef }[];
  mejoresAfinidades: AfinidadMutua[];
  generosos: { id: number; nombre: string; promedio: number }[];
  exigentes: { id: number; nombre: string; promedio: number }[];
}

export function calcularEstadisticas(votos: VotoParsed[], totalCurso: number): Estadisticas | null {
  if (votos.length === 0) return null;

  const nombrePorId = new Map<number, string>();
  for (const v of votos) {
    nombrePorId.set(v.votanteMoodleId, v.votanteNombre);
    for (const c of v.calificaciones) nombrePorId.set(c.id, c.nombre);
  }
  const ref = (id: number): AlumnoRef => ({ id, nombre: nombrePorId.get(id) ?? `#${id}` });

  // ── Básicas + distribución + popularidad ─────────────────────────────────
  let totalRatings = 0;
  let totalBloqueos = 0;
  const distribucion: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const recibidos = new Map<number, number[]>();
  const bloqueosRecibidos = new Map<number, number>();

  for (const v of votos) {
    totalRatings += v.calificaciones.length;
    if (v.bloqueadoMoodleId != null) {
      totalBloqueos++;
      bloqueosRecibidos.set(v.bloqueadoMoodleId, (bloqueosRecibidos.get(v.bloqueadoMoodleId) ?? 0) + 1);
    }
    for (const c of v.calificaciones) {
      distribucion[c.puntaje] = (distribucion[c.puntaje] ?? 0) + 1;
      if (!recibidos.has(c.id)) recibidos.set(c.id, []);
      recibidos.get(c.id)!.push(c.puntaje);
    }
  }

  const populares: EstadAlumno[] = [];
  for (const [id, puntajes] of recibidos) {
    populares.push({
      id,
      nombre: nombrePorId.get(id) ?? `#${id}`,
      promedio: redondear(media(puntajes)),
      totalVotos: puntajes.length,
      suma: puntajes.reduce((a, b) => a + b, 0),
      max: Math.max(...puntajes),
      min: Math.min(...puntajes),
      desviacion: redondear(desviacion(puntajes))
    });
  }
  populares.sort((a, b) => b.promedio - a.promedio || b.totalVotos - a.totalVotos);

  // ── Más bloqueados ───────────────────────────────────────────────────────
  const masBloqueados = [...bloqueosRecibidos.entries()]
    .map(([id, cantidad]) => ({ id, nombre: nombrePorId.get(id) ?? `#${id}`, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // ── Bloqueos mutuos (A bloquea a B y B bloquea a A) ──────────────────────
  const bloqueoPorVotante = new Map<number, number>();
  for (const v of votos) {
    if (v.bloqueadoMoodleId != null) bloqueoPorVotante.set(v.votanteMoodleId, v.bloqueadoMoodleId);
  }
  const bloqueosMutuos: { a: AlumnoRef; b: AlumnoRef }[] = [];
  const vistosMutuos = new Set<string>();
  for (const [a, b] of bloqueoPorVotante) {
    if (bloqueoPorVotante.get(b) === a) {
      const clave = `${Math.min(a, b)}-${Math.max(a, b)}`;
      if (!vistosMutuos.has(clave)) {
        vistosMutuos.add(clave);
        bloqueosMutuos.push({ a: ref(a), b: ref(b) });
      }
    }
  }

  // ── Afinidades mutuas + generosidad ──────────────────────────────────────
  const rating = (a: number, b: number): number | null => {
    const v = votos.find((x) => x.votanteMoodleId === a);
    if (!v) return null;
    const c = v.calificaciones.find((x) => x.id === b);
    return c ? c.puntaje : null;
  };
  const afinidades: AfinidadMutua[] = [];
  const paresVistos = new Set<string>();
  for (const v of votos) {
    const a = v.votanteMoodleId;
    for (const c of v.calificaciones) {
      const b = c.id;
      const r2 = rating(b, a);
      if (r2 == null) continue;
      const clave = `${Math.min(a, b)}-${Math.max(a, b)}`;
      if (paresVistos.has(clave)) continue;
      paresVistos.add(clave);
      afinidades.push({
        a: ref(a),
        b: ref(b),
        puntaje1: c.puntaje,
        puntaje2: r2,
        promedio: redondear((c.puntaje + r2) / 2),
        diferencia: Math.abs(c.puntaje - r2)
      });
    }
  }
  afinidades.sort((x, y) => y.promedio - x.promedio || x.diferencia - y.diferencia);

  // Votantes generosos vs exigentes
  const generosidad: { id: number; nombre: string; promedio: number }[] = [];
  for (const v of votos) {
    if (v.calificaciones.length > 0) {
      generosidad.push({
        id: v.votanteMoodleId,
        nombre: v.votanteNombre,
        promedio: redondear(media(v.calificaciones.map((c) => c.puntaje)))
      });
    }
  }
  const promGeneral = media(generosidad.map((g) => g.promedio));
  const generosos = generosidad
    .filter((g) => g.promedio > promGeneral + 0.5)
    .sort((a, b) => b.promedio - a.promedio);
  const exigentes = generosidad
    .filter((g) => g.promedio < promGeneral - 0.5)
    .sort((a, b) => a.promedio - b.promedio);

  return {
    totalVotantes: votos.length,
    totalRatings,
    totalBloqueos,
    participacion: totalCurso > 0 ? redondear((votos.length / totalCurso) * 100, 1) : 0,
    distribucion,
    populares,
    masBloqueados,
    bloqueosMutuos,
    mejoresAfinidades: afinidades,
    generosos,
    exigentes
  };
}
