// Sistema de alerta temprana (early warning system).
// Modelo "ABC" — Asistencia, Conducta (Behavior) y Rendimiento (Course
// performance) — de Balfanz, Herzog & Mac Iver (2007) y Allensworth & Easton
// (2007), más un cuarto indicador: Vínculos (sociograma), porque el aislamiento
// entre pares predice desenganche escolar (Parker & Asher, 1987).
//
// No es un "score de riesgo" opaco: cada área dice QUÉ se observó. El riesgo
// se acumula entre áreas (una sola señal pesa menos que varias), y se traduce
// a niveles de apoyo tipo MTSS/RTI (Fuchs & Fuchs, 2006):
//   Nivel 1 — universal (lo que recibe todo el curso)
//   Nivel 2 — apoyo focalizado (en pequeño grupo, seguimiento breve)
//   Nivel 3 — apoyo intensivo e individual (plan, familia, gabinete)

export type NivelArea = 'ok' | 'atencion' | 'alerta' | 'sin_datos';

export interface Indicador {
  nivel: NivelArea;
  detalle: string;
}

export interface DatosAlumnoAlerta {
  id: number;
  nombre: string;
  /** Ausencias en los últimos 30 días. */
  ausenciasRecientes: number;
  /** Ausencias en el ciclo lectivo. */
  ausenciasCiclo: number;
  retrasosRecientes: number;
  /** Amonestaciones de los últimos 60 días. */
  amonestaciones: { leve: number; mediana: number; grave: number };
  /** Promedios de observaciones docentes recientes (escala 1-5). */
  actitud: number | null;
  participacion: number | null;
  /** % de tareas completas en observaciones recientes. */
  tareasOk: number | null;
  /** Nota de Moodle 0-100; undefined = no se consultó. */
  nota?: number | null;
  /** Lectura del último sociograma del curso (null = no hay votación). */
  social: {
    recibidas: number;
    exposicion: number;
    /** Pedidos de "no quedar juntos" que recibió en la última votación. */
    rechazos: number;
    acompanar: boolean;
    sostenida: boolean;
  } | null;
}

export interface FilaAlerta {
  id: number;
  nombre: string;
  asistencia: Indicador;
  conducta: Indicador;
  rendimiento: Indicador;
  vinculos: Indicador;
  puntos: number;
  nivel: 1 | 2 | 3;
}

export const UMBRALES = {
  ausenciasAtencion: 2, // ~10 % de 20 días hábiles: ausentismo crónico (Balfanz & Byrnes, 2012)
  ausenciasAlerta: 4,   // ~20 %
  retrasosAtencion: 4,
  notaAlerta: 60,
  notaAtencion: 70,
  observacionBaja: 2    // "Bajo" o menos en la escala 1-5
};

function asistencia(d: DatosAlumnoAlerta): Indicador {
  const a = d.ausenciasRecientes;
  if (a >= UMBRALES.ausenciasAlerta)
    return { nivel: 'alerta', detalle: `${a} ausencias en los últimos 30 días (${d.ausenciasCiclo} en el ciclo).` };
  if (a >= UMBRALES.ausenciasAtencion)
    return { nivel: 'atencion', detalle: `${a} ausencias en los últimos 30 días (${d.ausenciasCiclo} en el ciclo).` };
  if (d.retrasosRecientes >= UMBRALES.retrasosAtencion)
    return { nivel: 'atencion', detalle: `${d.retrasosRecientes} llegadas tarde en los últimos 30 días.` };
  return { nivel: 'ok', detalle: `${a} ausencias en 30 días (${d.ausenciasCiclo} en el ciclo).` };
}

function conducta(d: DatosAlumnoAlerta): Indicador {
  const { leve, mediana, grave } = d.amonestaciones;
  const total = leve + mediana + grave;
  const partes: string[] = [];
  if (grave) partes.push(`${grave} grave${grave > 1 ? 's' : ''}`);
  if (mediana) partes.push(`${mediana} mediana${mediana > 1 ? 's' : ''}`);
  if (leve) partes.push(`${leve} leve${leve > 1 ? 's' : ''}`);
  const resumen = total ? `Amonestaciones en 60 días: ${partes.join(', ')}.` : '';
  if (grave >= 1 || total >= 3) return { nivel: 'alerta', detalle: resumen };
  if (total >= 1) return { nivel: 'atencion', detalle: resumen };
  if (d.actitud != null && d.actitud <= UMBRALES.observacionBaja)
    return { nivel: 'atencion', detalle: `Actitud observada baja (promedio ${d.actitud} de 5).` };
  return { nivel: 'ok', detalle: 'Sin amonestaciones recientes.' };
}

function rendimiento(d: DatosAlumnoAlerta): Indicador {
  if (d.nota != null) {
    if (d.nota < UMBRALES.notaAlerta) return { nivel: 'alerta', detalle: `Nota en Moodle: ${Math.round(d.nota)}.` };
    if (d.nota < UMBRALES.notaAtencion) return { nivel: 'atencion', detalle: `Nota en Moodle: ${Math.round(d.nota)}.` };
  }
  if (d.tareasOk != null && d.tareasOk < 50)
    return { nivel: 'atencion', detalle: `Completa el ${d.tareasOk}% de las tareas observadas.` };
  if (d.participacion != null && d.participacion <= UMBRALES.observacionBaja)
    return { nivel: 'atencion', detalle: `Participación observada baja (promedio ${d.participacion} de 5).` };
  if (d.nota == null && d.tareasOk == null && d.participacion == null)
    return { nivel: 'sin_datos', detalle: d.nota === undefined ? 'Sin observaciones (notas no consultadas).' : 'Sin nota ni observaciones.' };
  return { nivel: 'ok', detalle: d.nota != null ? `Nota en Moodle: ${Math.round(d.nota)}.` : 'Sin señales en observaciones.' };
}

function vinculos(d: DatosAlumnoAlerta): Indicador {
  const s = d.social;
  if (!s) return { nivel: 'sin_datos', detalle: 'Sin votación de agrupamientos reciente.' };
  const rech = s.rechazos > 0 ? ` ${s.rechazos} pedido${s.rechazos > 1 ? 's' : ''} de no quedar juntos.` : '';
  if (s.sostenida) return { nivel: 'alerta', detalle: `Poco elegido en varias votaciones seguidas.${rech}` };
  if (s.exposicion >= 3 && s.recibidas === 0)
    return { nivel: 'alerta', detalle: `No recibió elecciones (podían elegirlo ${s.exposicion}).${rech}` };
  // Rechazo activo de varios compañeros: señal propia aunque reciba elecciones (Coie & Dodge, 1983).
  if (s.rechazos >= 3) return { nivel: 'alerta', detalle: `Recibió ${s.recibidas} de ${s.exposicion} elecciones.${rech}` };
  if (s.acompanar || s.rechazos >= 2)
    return { nivel: 'atencion', detalle: `Recibió ${s.recibidas} de ${s.exposicion} elecciones posibles.${rech}` };
  return { nivel: 'ok', detalle: `Recibió ${s.recibidas} de ${s.exposicion} elecciones posibles.${rech}` };
}

const PESO: Record<NivelArea, number> = { alerta: 2, atencion: 1, ok: 0, sin_datos: 0 };

export function evaluarAlumno(d: DatosAlumnoAlerta): FilaAlerta {
  const fila = {
    id: d.id,
    nombre: d.nombre,
    asistencia: asistencia(d),
    conducta: conducta(d),
    rendimiento: rendimiento(d),
    vinculos: vinculos(d)
  };
  const puntos =
    PESO[fila.asistencia.nivel] + PESO[fila.conducta.nivel] + PESO[fila.rendimiento.nivel] + PESO[fila.vinculos.nivel];
  const nivel: 1 | 2 | 3 = puntos >= 4 ? 3 : puntos >= 2 ? 2 : 1;
  return { ...fila, puntos, nivel };
}

/** Motivo de apertura de caso a partir de las áreas comprometidas. */
export function motivoDesdeAlerta(f: FilaAlerta): string {
  const areas: [string, Indicador][] = [
    ['Asistencia', f.asistencia], ['Conducta', f.conducta], ['Rendimiento', f.rendimiento], ['Vínculos', f.vinculos]
  ];
  const lineas = areas
    .filter(([, i]) => i.nivel === 'alerta' || i.nivel === 'atencion')
    .map(([n, i]) => `• ${n} (${i.nivel === 'alerta' ? 'alerta' : 'atención'}): ${i.detalle}`);
  return `Detectado por el sistema de alerta temprana (nivel ${f.nivel}).\n${lineas.join('\n')}`;
}
