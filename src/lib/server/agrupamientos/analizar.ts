// Análisis psicopedagógico del sociograma.
// Enfoque constructivo: describe la dinámica del grupo y sugiere acciones para
// trabajar fortalezas y debilidades, evitando etiquetar o estigmatizar alumnos.
// Fundamentos: Moreno (sociometría), Coie & Dodge (estatus sociométrico),
// Parker & Asher (amistad recíproca como factor protector), Johnson & Johnson
// y Slavin (aprendizaje cooperativo), Cohen & Lotan (tratamiento del estatus).
//
// Calibración: cada alumno se compara contra cuántos compañeros PODÍAN elegirlo
// (su exposición), no contra el total de votos. Sin base suficiente (menos de
// 3 compañeros que pudieran elegirlo) no se saca ninguna conclusión.

import type { AlumnoRef } from './tipos.js';
import { media, desviacion, redondear } from './stats.js';
import type { Grafo } from './grafo.js';

export interface MetricaAlumno {
  id: number;
  nombre: string;
  voto: boolean;
  /** Elecciones positivas recibidas. */
  recibidas: number;
  /** Compañeros que podían elegirlo. */
  exposicion: number;
  /** recibidas / exposición (null si no hay base). */
  tasa: number | null;
  mutuas: number;
  rechazos: number;
}

export interface RelacionReciproca {
  a: AlumnoRef;
  b: AlumnoRef;
}

export interface ClusterSocial {
  miembros: AlumnoRef[];
  /** % de pares del subgrupo con elección recíproca. */
  densidad: number;
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
  modo: Grafo['modo'];
  totalParticipantes: number;
  totalCurso: number;
  participacion: number; // % del curso que votó
  metricas: MetricaAlumno[];
  reciprocas: RelacionReciproca[];
  porcentajeReciprocidad: number;
  clusters: ClusterSocial[];
  paraAcompanar: AlumnoParaAcompanar[];
  referentes: AlumnoReferente[];
  recomendaciones: Recomendacion[];
  advertencias: string[];
  climaGrupal: 'equilibrado' | 'requiere_atencion';
}

const BASE_MINIMA = 3;

export function analizarRelacionesSociales(g: Grafo): AnalisisSocial | null {
  if (g.votantes.size === 0) return null;
  const nom = g.modo === 'nominacion';
  const ref = (id: number): AlumnoRef => ({ id, nombre: g.nombre(id) });

  // ── Métricas por alumno ──────────────────────────────────────────────────
  const metricas: MetricaAlumno[] = g.alumnos.map((a) => {
    const exposicion = g.exposicion(a.id);
    const recibidas = g.recibidas(a.id);
    return {
      id: a.id,
      nombre: a.nombre,
      voto: g.votantes.has(a.id),
      recibidas,
      exposicion,
      tasa: exposicion > 0 ? redondear(recibidas / exposicion, 3) : null,
      mutuas: g.mutuasDe(a.id).length,
      rechazos: g.rechazosRecibidos(a.id)
    };
  });
  const conBase = metricas.filter((m) => m.exposicion >= BASE_MINIMA && m.tasa != null);
  const tasas = conBase.map((m) => m.tasa!);
  const mediaT = media(tasas);
  const desvT = desviacion(tasas);

  // ── Reciprocidad ─────────────────────────────────────────────────────────
  // De las elecciones hechas a alguien que también votó, ¿cuántas fueron devueltas?
  let elecciones = 0;
  let devueltas = 0;
  for (const a of g.votantes) {
    for (const b of g.eleccionesDe(a)) {
      if (!g.opino(b, a)) continue; // b no tuvo oportunidad de devolverla
      elecciones++;
      if (g.elige(b, a)) devueltas++;
    }
  }
  const porcentajeReciprocidad = elecciones > 0 ? redondear((devueltas / elecciones) * 100, 0) : 0;
  const reciprocas = g.paresMutuos.map(([a, b]) => ({ a: ref(a), b: ref(b) }));

  // ── Subgrupos: componentes conexas de las elecciones recíprocas ──────────
  const vecinos = new Map<number, number[]>();
  for (const [a, b] of g.paresMutuos) {
    vecinos.set(a, [...(vecinos.get(a) ?? []), b]);
    vecinos.set(b, [...(vecinos.get(b) ?? []), a]);
  }
  const visto = new Set<number>();
  const clusters: ClusterSocial[] = [];
  for (const inicio of vecinos.keys()) {
    if (visto.has(inicio)) continue;
    const comp: number[] = [];
    const pila = [inicio];
    visto.add(inicio);
    while (pila.length) {
      const x = pila.pop()!;
      comp.push(x);
      for (const y of vecinos.get(x) ?? []) if (!visto.has(y)) { visto.add(y); pila.push(y); }
    }
    if (comp.length < 2) continue;
    const enComp = new Set(comp);
    const aristas = g.paresMutuos.filter(([a, b]) => enComp.has(a) && enComp.has(b)).length;
    const posibles = (comp.length * (comp.length - 1)) / 2;
    clusters.push({
      miembros: comp.map(ref).sort((x, y) => x.nombre.localeCompare(y.nombre, 'es')),
      densidad: redondear((aristas / posibles) * 100, 0)
    });
  }
  clusters.sort((a, b) => b.miembros.length - a.miembros.length || b.densidad - a.densidad);

  // ── Alumnos para acompañar ───────────────────────────────────────────────
  const paraAcompanar: AlumnoParaAcompanar[] = [];
  for (const m of metricas) {
    const observaciones: string[] = [];
    const sugerencias: string[] = [];
    let prioridad = 0;
    const conDatos = m.exposicion >= BASE_MINIMA && m.tasa != null;
    let pocoElegido = false;

    if (conDatos && m.recibidas === 0) {
      observaciones.push(
        nom
          ? `Nadie lo eligió en esta votación (podían hacerlo ${m.exposicion} compañeros).`
          : `Ninguno de los ${m.exposicion} compañeros que lo calificaron le dio 4 o 5.`
      );
      prioridad += 3;
      pocoElegido = true;
    } else if (conDatos && desvT > 0 && m.tasa! < mediaT - desvT) {
      observaciones.push('Recibió menos elecciones que la mayoría del curso.');
      prioridad += 2;
      pocoElegido = true;
    }
    if (nom && m.voto && m.mutuas === 0 && m.recibidas > 0) {
      observaciones.push('Ninguna de sus elecciones fue recíproca.');
      prioridad += 1;
    }
    if (m.rechazos >= 2) {
      observaciones.push(`${m.rechazos} compañeros pidieron no quedar en el mismo grupo.`);
      prioridad += 2;
    } else if (m.rechazos === 1) {
      observaciones.push('Un compañero pidió no quedar en el mismo grupo.');
      prioridad += 1;
    }

    // Una sola señal débil no alcanza para listarlo.
    if (prioridad < 2) continue;

    if (!m.voto) observaciones.push('No participó de la votación.');

    const eligio = g.eleccionesDe(m.id).map(g.nombre);
    if (eligio.length > 0) {
      sugerencias.push(`Ubicarlo con al menos uno de los compañeros que eligió: ${eligio.join(', ')}.`);
    } else {
      sugerencias.push('Ubicarlo con compañeros receptivos y con buena disposición.');
    }
    sugerencias.push(
      'Asignarle un rol con valor y responsabilidad dentro del grupo (vocero, coordinador de materiales, relator).'
    );
    if (pocoElegido) {
      sugerencias.push('Hacer visible alguna fortaleza suya frente al grupo para elevar su reconocimiento.');
    }
    if (m.rechazos > 0) {
      sugerencias.push('Evitar ubicarlo con quienes marcaron incompatibilidad; trabajar ese vínculo aparte.');
    }
    paraAcompanar.push({
      id: m.id,
      nombre: m.nombre,
      prioridad: Math.min(prioridad, 5),
      observaciones,
      sugerencias
    });
  }
  paraAcompanar.sort((a, b) => b.prioridad - a.prioridad || a.nombre.localeCompare(b.nombre, 'es'));

  // ── Referentes positivos ─────────────────────────────────────────────────
  const referentes: AlumnoReferente[] = [];
  for (const m of conBase) {
    if (m.rechazos > 0) continue;
    const alto = m.tasa! >= mediaT + desvT && m.recibidas >= BASE_MINIMA;
    if (!alto) continue;
    const cualidades = [
      nom
        ? `Lo eligieron ${m.recibidas} de ${m.exposicion} compañeros`
        : `${m.recibidas} de ${m.exposicion} compañeros le dieron 4 o 5`
    ];
    if (m.mutuas >= 2) cualidades.push(`${m.mutuas} vínculos recíprocos`);
    referentes.push({ id: m.id, nombre: m.nombre, puntaje: m.recibidas, cualidades });
  }
  referentes.sort((a, b) => b.puntaje - a.puntaje);

  // ── Advertencias de calidad de los datos ─────────────────────────────────
  const totalCurso = g.alumnos.length;
  const participacion = totalCurso > 0 ? redondear((g.votantes.size / totalCurso) * 100, 0) : 0;
  const advertencias: string[] = [];
  if (!nom) {
    advertencias.push(
      'Sesión con el formato anterior: cada alumno calificó solo a unos pocos compañeros asignados ' +
        'al azar, así que casi ningún par se evaluó mutuamente. Los vínculos recíprocos y los ' +
        'subgrupos son poco confiables; para una lectura sólida, hacé una votación nueva con elección de compañeros.'
    );
  }
  if (participacion < 70) {
    advertencias.push(
      `Votó el ${participacion}% del curso: la lectura es parcial (los que no votaron no pudieron elegir a nadie).`
    );
  }
  const sinBase = metricas.filter((m) => m.exposicion < BASE_MINIMA).length;
  if (sinBase > 0) {
    advertencias.push(
      `${sinBase} alumno(s) sin datos suficientes para sacar conclusiones (menos de ${BASE_MINIMA} compañeros podían elegirlos).`
    );
  }

  // ── Recomendaciones pedagógicas (con fundamento) ─────────────────────────
  const recomendaciones: Recomendacion[] = [];
  const nadie = paraAcompanar.filter((p) => metricas.find((m) => m.id === p.id)?.recibidas === 0);
  if (nadie.length > 0) {
    recomendaciones.push({
      texto:
        `${nadie.length} alumno(s) no recibieron elecciones. Ubicarlos con al menos uno de los ` +
        'compañeros que ELLOS eligieron: tener un vínculo recíproco en el aula protege frente al ' +
        'aislamiento aunque la aceptación general sea baja.',
      fundamento: 'Parker & Asher (1993), Developmental Psychology 29(4).'
    });
  }
  if (paraAcompanar.length > 0) {
    recomendaciones.push({
      texto:
        'Para los alumnos menos elegidos, asignarles roles con estatus y competencias visibles ' +
        'dentro del grupo, y destacar públicamente algo que hacen bien (asignar competencia). ' +
        'Subir su reconocimiento cambia cómo los ven sus compañeros.',
      fundamento: 'Instrucción Compleja — Cohen & Lotan, "Designing Groupwork" (tratamiento del estatus).'
    });
  }
  if (referentes.length > 0) {
    recomendaciones.push({
      texto:
        'Distribuir a los alumnos más elegidos en distintos grupos y darles roles que requieran ' +
        'escuchar y sumar a otros (no solo liderar), sin sobrecargarlos.',
      fundamento: 'Cohen & Lotan (estatus en el grupo); tutoría entre pares — Topping (2005).'
    });
  }
  const cerrados = clusters.filter((c) => c.miembros.length >= 4 && c.densidad >= 50);
  if (cerrados.length > 0) {
    recomendaciones.push({
      texto:
        `Se detectaron ${cerrados.length} subgrupo(s) muy cerrado(s). Intercalar a sus integrantes ` +
        'con otros compañeros en algunas actividades favorece la integración del curso.',
      fundamento: 'Hipótesis del contacto intergrupal — Gordon Allport.'
    });
  }
  recomendaciones.push({
    texto:
      'Rotar la conformación de los grupos y repetir la votación cada tanto: el sociograma es una ' +
      'foto del momento, no una etiqueta. Comparar votaciones permite ver la evolución.',
    fundamento: 'Sociometría — Jacob Moreno.'
  });
  recomendaciones.push({
    texto:
      'Comunicar a los alumnos que la votación sirve para armar mejores equipos de trabajo, ' +
      'no para rankear a nadie. Mantener los resultados en reserva y usarlos con cuidado.',
    fundamento: 'Uso ético de la sociometría en el aula (Mayeux, Underwood & Risser, 2007).'
  });

  const alta = paraAcompanar.filter((a) => a.prioridad >= 3).length;

  return {
    modo: g.modo,
    totalParticipantes: g.votantes.size,
    totalCurso,
    participacion,
    metricas,
    reciprocas,
    porcentajeReciprocidad,
    clusters,
    paraAcompanar,
    referentes,
    recomendaciones,
    advertencias,
    // Que 1 o 2 alumnos estén poco integrados es lo esperable en cualquier curso;
    // el clima pide atención cuando son más del ~15 %.
    climaGrupal: alta >= Math.max(3, Math.ceil(totalCurso * 0.15)) ? 'requiere_atencion' : 'equilibrado'
  };
}
