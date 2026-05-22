// Análisis psicopedagógico del sociograma.
// Enfoque constructivo: describe la dinámica del grupo y sugiere acciones para
// trabajar fortalezas y debilidades, evitando etiquetar o estigmatizar alumnos.
// Fundamentos: Moreno (sociometría), Johnson & Johnson y Slavin (aprendizaje
// cooperativo), Elizabeth Cohen (Instrucción Compleja / tratamiento del estatus).

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

/** Alumno cuya integración conviene acompañar (sin etiquetarlo). */
export interface AlumnoParaAcompanar {
  id: number;
  nombre: string;
  prioridad: number; // 1-5: cuánta atención conviene darle
  observaciones: string[]; // hechos objetivos, redactados sin juicio de valor
  sugerencias: string[]; // acciones concretas para acompañarlo
}

/** Alumno con buen reconocimiento del grupo (referente positivo). */
export interface AlumnoReferente {
  id: number;
  nombre: string;
  puntaje: number;
  cualidades: string[];
}

export interface Recomendacion {
  texto: string;
  fundamento: string;
}

export interface AnalisisSocial {
  totalParticipantes: number;
  popularidad: MetricaPopularidad[];
  reciprocas: RelacionReciproca[];
  noReciprocas: number;
  porcentajeReciprocidad: number;
  clusters: ClusterSocial[];
  paraAcompanar: AlumnoParaAcompanar[];
  referentes: AlumnoReferente[];
  recomendaciones: Recomendacion[];
  climaGrupal: 'equilibrado' | 'requiere_atencion';
}

const UMBRAL_AFINIDAD = 4;

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
    for (const c of v.calificaciones) if (c.puntaje >= UMBRAL_AFINIDAD) set.add(c.id);
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
      for (const m1 of grupo) for (const m2 of grupo) {
        if (m1 === m2) continue;
        const r = rating(m1, m2);
        if (r != null) internos.push(r);
      }
      clusters.push({ miembros: [...grupo].map(ref), cohesion: redondear(media(internos)) });
      for (const m of grupo) procesados.add(m);
    }
  }
  clusters.sort((a, b) => b.cohesion - a.cohesion);

  // ── Alumnos para acompañar (enfoque constructivo) ────────────────────────
  const promedios = popularidad.map((m) => m.promedio);
  const promGeneral = media(promedios);
  const desvGeneral = desviacion(promedios);
  const bloqueosRecibidos = (id: number) => votos.filter((v) => v.bloqueadoMoodleId === id).length;

  const paraAcompanar: AlumnoParaAcompanar[] = [];
  for (const m of popularidad) {
    const observaciones: string[] = [];
    const sugerencias: string[] = [];
    let prioridad = 0;
    let pocoElegido = false;
    let bloqueado = false;
    let disparidad = false;

    if (m.promedio < promGeneral - desvGeneral) {
      observaciones.push('Recibió valoraciones de afinidad por debajo del promedio del curso.');
      prioridad += 2;
      pocoElegido = true;
    }
    const calBajas = votos.filter((v) => {
      const c = v.calificaciones.find((x) => x.id === m.id);
      return c != null && c.puntaje <= 2;
    }).length;
    if (calBajas > votos.length * 0.3) {
      observaciones.push('Varios compañeros lo eligieron poco en esta votación.');
      prioridad += 2;
      pocoElegido = true;
    }
    if (m.desviacion > 1.5) {
      observaciones.push('Las valoraciones que recibió son dispares: algunos lo eligen mucho y otros poco.');
      prioridad += 1;
      disparidad = true;
    }
    if (m.totalVotos < votos.length * 0.5) {
      observaciones.push('Pocos compañeros lo incluyeron entre los que evaluaron.');
      prioridad += 1;
    }
    const bloq = bloqueosRecibidos(m.id);
    if (bloq > 0) {
      observaciones.push(`Algún compañero pidió no quedar en el mismo grupo (${bloq}).`);
      prioridad += bloq >= 2 ? 2 : 1;
      bloqueado = true;
    }

    if (observaciones.length > 0) {
      // Sugerencias concretas, en positivo
      sugerencias.push(
        'Asignarle un rol con valor y responsabilidad dentro del grupo (vocero, coordinador de materiales, relator).'
      );
      if (disparidad) {
        sugerencias.push('Apoyarse en los compañeros que sí lo valoran para armar su grupo.');
      } else {
        sugerencias.push('Emparejarlo con compañeros receptivos y con buena disposición.');
      }
      if (bloqueado) {
        sugerencias.push('Evitar ubicarlo con quienes marcaron incompatibilidad; trabajar ese vínculo aparte.');
      }
      if (pocoElegido) {
        sugerencias.push('Hacer visible alguna fortaleza suya frente al grupo para elevar su reconocimiento.');
      }
      paraAcompanar.push({
        id: m.id,
        nombre: m.nombre,
        prioridad: Math.min(prioridad, 5),
        observaciones,
        sugerencias
      });
    }
  }
  paraAcompanar.sort((a, b) => b.prioridad - a.prioridad);

  // ── Referentes positivos (buen reconocimiento del grupo) ─────────────────
  const referentes: AlumnoReferente[] = [];
  for (const m of popularidad) {
    let puntaje = 0;
    const cualidades: string[] = [];
    if (m.promedio >= 4.0) {
      puntaje += 3;
      cualidades.push('Muy bien valorado por el grupo');
    }
    if (m.desviacion <= 1.0 && m.totalVotos > 1) {
      puntaje += 2;
      cualidades.push('Valoración pareja entre sus compañeros');
    }
    if (m.totalVotos >= votos.length * 0.8) {
      puntaje += 2;
      cualidades.push('Reconocido por casi todo el curso');
    }
    const altas = votos.filter((v) => {
      const c = v.calificaciones.find((x) => x.id === m.id);
      return c != null && c.puntaje >= 4;
    }).length;
    if (altas >= votos.length * 0.4) {
      puntaje += 2;
      cualidades.push('Muchos compañeros lo eligen con puntaje alto');
    }
    if (puntaje >= 4) {
      referentes.push({ id: m.id, nombre: m.nombre, puntaje, cualidades });
    }
  }
  referentes.sort((a, b) => b.puntaje - a.puntaje);

  // ── Recomendaciones pedagógicas (con fundamento) ─────────────────────────
  const recomendaciones: Recomendacion[] = [];

  recomendaciones.push({
    texto:
      'Conformar grupos heterogéneos y mixtos en lugar de homogéneos: distintos niveles, ' +
      'géneros y vínculos en cada grupo mejoran el rendimiento de todos y la cohesión del curso.',
    fundamento: 'Aprendizaje cooperativo — Johnson & Johnson; Slavin (método STAD).'
  });
  recomendaciones.push({
    texto:
      'Rotar la conformación de los grupos cada cierto tiempo. El sociograma es una foto del ' +
      'momento, no una etiqueta fija: repetir la votación periódicamente permite ver la evolución.',
    fundamento: 'Sociometría — Jacob Moreno.'
  });

  if (paraAcompanar.length > 0) {
    recomendaciones.push({
      texto:
        'Para los alumnos menos elegidos, asignarles roles con estatus y competencias visibles ' +
        'dentro del grupo, y destacar públicamente algo que hacen bien. Subir su reconocimiento ' +
        'cambia cómo los ven sus compañeros.',
      fundamento: 'Instrucción Compleja — Elizabeth Cohen, "Designing Groupwork" (tratamiento del estatus).'
    });
  }
  if (referentes.length > 0) {
    recomendaciones.push({
      texto:
        'Aprovechar a los alumnos con buen reconocimiento como apoyos: distribuirlos en distintos ' +
        'grupos y proponerles acompañar a compañeros, sin sobrecargarlos.',
      fundamento: 'Tutoría entre pares (peer tutoring).'
    });
  }
  const clustersGrandes = clusters.filter((c) => c.miembros.length >= 4);
  if (clustersGrandes.length > 0) {
    recomendaciones.push({
      texto:
        `Se detectaron ${clustersGrandes.length} grupo(s) muy cerrado(s). Intercalar a sus integrantes ` +
        'con otros compañeros en algunas actividades favorece la integración del curso.',
      fundamento: 'Hipótesis del contacto intergrupal — Gordon Allport.'
    });
  }
  recomendaciones.push({
    texto:
      'Comunicar a los alumnos que la votación sirve para armar mejores equipos de trabajo, ' +
      'no para rankear a nadie. Mantener los resultados en reserva y usarlos con cuidado.',
    fundamento: 'Uso ético de la sociometría en el aula.'
  });

  const alta = paraAcompanar.filter((a) => a.prioridad >= 3).length;

  return {
    totalParticipantes: votos.length,
    popularidad,
    reciprocas,
    noReciprocas,
    porcentajeReciprocidad,
    clusters,
    paraAcompanar,
    referentes,
    recomendaciones,
    climaGrupal: alta > 3 ? 'requiere_atencion' : 'equilibrado'
  };
}
