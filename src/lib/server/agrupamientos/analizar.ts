// Análisis psicopedagógico del sociograma.
// Portado de `AnalizadorPsicopedagogico` de la app Flask original.

import type { VotoParsed, AlumnoRef } from './tipos.js';
import { media, mediana, desviacion, redondear } from './stats.js';

export interface MetricaPopularidad {
  id: number;
  nombre: string;
  promedio: number;
  mediana: number;
  totalVotos: number;
  max: number;
  min: number;
  desviacion: number;
}

export interface RelacionReciproca {
  a: AlumnoRef;
  b: AlumnoRef;
  puntajeAB: number;
  puntajeBA: number;
  diferencia: number;
}

export interface ClusterSocial {
  miembros: AlumnoRef[];
  cohesion: number;
}

export interface AlumnoEnRiesgo {
  id: number;
  nombre: string;
  nivelRiesgo: number; // 1-5
  factores: string[];
}

export interface LiderPotencial {
  id: number;
  nombre: string;
  puntajeLiderazgo: number;
  cualidades: string[];
}

export interface AnalisisSocial {
  totalParticipantes: number;
  popularidad: MetricaPopularidad[];
  reciprocas: RelacionReciproca[];
  noReciprocas: number;
  porcentajeReciprocidad: number;
  clusters: ClusterSocial[];
  riesgo: AlumnoEnRiesgo[];
  lideres: LiderPotencial[];
  recomendaciones: string[];
  nivelAlerta: 'ALTO' | 'NORMAL';
}

const UMBRAL_AFINIDAD = 4; // puntaje ≥ 4 indica afinidad fuerte

export function analizarRelacionesSociales(votos: VotoParsed[]): AnalisisSocial | null {
  if (votos.length === 0) return null;

  const nombrePorId = new Map<number, string>();
  for (const v of votos) {
    nombrePorId.set(v.votanteMoodleId, v.votanteNombre);
    for (const c of v.calificaciones) nombrePorId.set(c.id, c.nombre);
  }
  const ref = (id: number): AlumnoRef => ({ id, nombre: nombrePorId.get(id) ?? `#${id}` });

  const rating = (a: number, b: number): number | null => {
    const v = votos.find((x) => x.votanteMoodleId === a);
    if (!v) return null;
    const c = v.calificaciones.find((x) => x.id === b);
    return c ? c.puntaje : null;
  };

  // ── Popularidad ──────────────────────────────────────────────────────────
  const recibidos = new Map<number, number[]>();
  for (const v of votos) {
    for (const c of v.calificaciones) {
      if (!recibidos.has(c.id)) recibidos.set(c.id, []);
      recibidos.get(c.id)!.push(c.puntaje);
    }
  }
  const popularidad: MetricaPopularidad[] = [];
  for (const [id, puntajes] of recibidos) {
    popularidad.push({
      id,
      nombre: nombrePorId.get(id) ?? `#${id}`,
      promedio: redondear(media(puntajes)),
      mediana: mediana(puntajes),
      totalVotos: puntajes.length,
      max: Math.max(...puntajes),
      min: Math.min(...puntajes),
      desviacion: redondear(desviacion(puntajes))
    });
  }
  popularidad.sort((a, b) => b.promedio - a.promedio);

  // ── Reciprocidad ─────────────────────────────────────────────────────────
  const reciprocas: RelacionReciproca[] = [];
  let noReciprocas = 0;
  const paresVistos = new Set<string>();
  for (const v of votos) {
    const a = v.votanteMoodleId;
    for (const c of v.calificaciones) {
      const b = c.id;
      const rBA = rating(b, a);
      if (rBA == null) continue;
      const clave = `${Math.min(a, b)}-${Math.max(a, b)}`;
      if (paresVistos.has(clave)) continue;
      paresVistos.add(clave);
      const diferencia = Math.abs(c.puntaje - rBA);
      if (diferencia <= 1) {
        reciprocas.push({ a: ref(a), b: ref(b), puntajeAB: c.puntaje, puntajeBA: rBA, diferencia });
      } else {
        noReciprocas++;
      }
    }
  }
  const totalRel = reciprocas.length + noReciprocas;
  const porcentajeReciprocidad = totalRel > 0 ? redondear((reciprocas.length / totalRel) * 100) : 0;

  // ── Clusters sociales (afinidad mutua ≥ 4) ───────────────────────────────
  const afinidades = new Map<number, Set<number>>();
  for (const v of votos) {
    const set = new Set<number>();
    for (const c of v.calificaciones) {
      if (c.puntaje >= UMBRAL_AFINIDAD) set.add(c.id);
    }
    afinidades.set(v.votanteMoodleId, set);
  }
  const clusters: ClusterSocial[] = [];
  const procesados = new Set<number>();
  for (const [alumno, amigos] of afinidades) {
    if (procesados.has(alumno)) continue;
    const grupo = new Set<number>([alumno]);
    for (const amigo of amigos) {
      const amigosDelAmigo = afinidades.get(amigo);
      if (amigosDelAmigo && amigosDelAmigo.has(alumno)) grupo.add(amigo);
    }
    if (grupo.size >= 2) {
      const internos: number[] = [];
      for (const m1 of grupo) {
        for (const m2 of grupo) {
          if (m1 === m2) continue;
          const r = rating(m1, m2);
          if (r != null) internos.push(r);
        }
      }
      clusters.push({
        miembros: [...grupo].map(ref),
        cohesion: redondear(media(internos))
      });
      for (const m of grupo) procesados.add(m);
    }
  }
  clusters.sort((a, b) => b.cohesion - a.cohesion);

  // ── Alumnos en riesgo de aislamiento ─────────────────────────────────────
  const riesgo: AlumnoEnRiesgo[] = [];
  const promedios = popularidad.map((m) => m.promedio);
  const promGeneral = media(promedios);
  const desvGeneral = desviacion(promedios);
  const bloqueosRecibidos = (id: number) => votos.filter((v) => v.bloqueadoMoodleId === id).length;

  for (const m of popularidad) {
    const factores: string[] = [];
    let nivel = 0;

    if (m.promedio < promGeneral - desvGeneral) {
      factores.push('Promedio de calificaciones bajo');
      nivel += 2;
    }
    const calBajas = votos.filter((v) => {
      const c = v.calificaciones.find((x) => x.id === m.id);
      return c != null && c.puntaje <= 2;
    }).length;
    if (calBajas > votos.length * 0.3) {
      factores.push('Recibe muchas calificaciones bajas');
      nivel += 2;
    }
    if (m.desviacion > 1.5) {
      factores.push('Alta variabilidad en las calificaciones recibidas');
      nivel += 1;
    }
    if (m.totalVotos < votos.length * 0.7) {
      factores.push('Pocos compañeros lo califican');
      nivel += 1;
    }
    const bloq = bloqueosRecibidos(m.id);
    if (bloq > 0) {
      factores.push(`Fue bloqueado por ${bloq} compañero(s)`);
      nivel += bloq >= 2 ? 2 : 1;
    }

    if (factores.length > 0) {
      riesgo.push({ id: m.id, nombre: m.nombre, nivelRiesgo: Math.min(nivel, 5), factores });
    }
  }
  riesgo.sort((a, b) => b.nivelRiesgo - a.nivelRiesgo);

  // ── Líderes potenciales ──────────────────────────────────────────────────
  const lideres: LiderPotencial[] = [];
  for (const m of popularidad) {
    let puntaje = 0;
    const cualidades: string[] = [];

    if (m.promedio >= 4.0) {
      puntaje += 3;
      cualidades.push('Alta popularidad general');
    }
    if (m.desviacion <= 1.0 && m.totalVotos > 1) {
      puntaje += 2;
      cualidades.push('Evaluación consistente');
    }
    if (m.totalVotos >= votos.length * 0.8) {
      puntaje += 2;
      cualidades.push('Amplio reconocimiento');
    }
    const califAltas = votos.filter((v) => {
      const c = v.calificaciones.find((x) => x.id === m.id);
      return c != null && c.puntaje >= 4;
    }).length;
    if (califAltas >= votos.length * 0.4) {
      puntaje += 2;
      cualidades.push('Recibe muchas calificaciones altas');
    }

    if (puntaje >= 4) {
      lideres.push({ id: m.id, nombre: m.nombre, puntajeLiderazgo: puntaje, cualidades });
    }
  }
  lideres.sort((a, b) => b.puntajeLiderazgo - a.puntajeLiderazgo);

  // ── Recomendaciones ──────────────────────────────────────────────────────
  const recomendaciones: string[] = [];
  const altoRiesgo = riesgo.filter((r) => r.nivelRiesgo >= 3);
  if (altoRiesgo.length > 0) {
    recomendaciones.push(
      `PRIORIDAD ALTA: ${altoRiesgo.length} alumno(s) con riesgo de aislamiento social. ` +
        'Considerar seguimiento individual y actividades de integración.'
    );
  }
  const gruposGrandes = clusters.filter((c) => c.miembros.length >= 4);
  if (gruposGrandes.length > 0) {
    recomendaciones.push(
      `Se detectaron ${gruposGrandes.length} grupo(s) muy cohesionado(s). ` +
        'Considerar mezclarlos para promover la integración del curso.'
    );
  }
  const enClusters = clusters.reduce((acc, c) => acc + c.miembros.length, 0);
  if (popularidad.length > 0 && enClusters < popularidad.length * 0.7) {
    recomendaciones.push(
      'Muchos alumnos no pertenecen a un grupo definido. Considerar actividades de integración grupal.'
    );
  }
  if (recomendaciones.length === 0) {
    recomendaciones.push('El grupo presenta una dinámica social equilibrada, sin alertas significativas.');
  }

  return {
    totalParticipantes: votos.length,
    popularidad,
    reciprocas,
    noReciprocas,
    porcentajeReciprocidad,
    clusters,
    riesgo,
    lideres,
    recomendaciones,
    nivelAlerta: altoRiesgo.length > 3 ? 'ALTO' : 'NORMAL'
  };
}
