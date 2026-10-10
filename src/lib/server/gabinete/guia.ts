// Catálogos y guía de intervención por nivel de apoyo (con fundamento).

export const ESTADOS_CASO = [
  { id: 'derivado', nombre: 'Derivado', desc: 'Llegó la derivación; falta la primera evaluación.' },
  { id: 'evaluacion', nombre: 'En evaluación', desc: 'Recolectando información (entrevistas, observación).' },
  { id: 'intervencion', nombre: 'En intervención', desc: 'Hay un plan de apoyo en marcha.' },
  { id: 'seguimiento', nombre: 'En seguimiento', desc: 'Mejoró; se monitorea con menor frecuencia.' },
  { id: 'cerrado', nombre: 'Cerrado', desc: 'Sin necesidad de apoyo adicional por ahora.' }
] as const;
export type EstadoCaso = (typeof ESTADOS_CASO)[number]['id'];
export const ESTADO_IDS = ESTADOS_CASO.map((e) => e.id) as string[];

export const TIPOS_INTERVENCION = [
  { id: 'entrevista_alumno', nombre: 'Entrevista con el alumno' },
  { id: 'entrevista_familia', nombre: 'Entrevista con la familia' },
  { id: 'reunion_docentes', nombre: 'Reunión con docentes / equipo' },
  { id: 'observacion_aula', nombre: 'Observación en el aula' },
  { id: 'plan_apoyo', nombre: 'Plan de apoyo (objetivos y acuerdos)' },
  { id: 'check_connect', nombre: 'Encuentro de seguimiento (Check & Connect)' },
  { id: 'derivacion_externa', nombre: 'Derivación / articulación externa' },
  { id: 'derivacion', nombre: 'Derivación recibida' },
  { id: 'seguimiento', nombre: 'Revisión del caso' },
  { id: 'otro', nombre: 'Otro' }
] as const;
export const TIPO_IDS = TIPOS_INTERVENCION.map((t) => t.id) as string[];

/** Cada cuánto revisar un caso según el nivel (monitoreo del progreso). */
export const DIAS_REVISION: Record<number, number> = { 1: 56, 2: 28, 3: 14 };

export function fechaMasDias(dias: number, desde = new Date()): string {
  const d = new Date(desde);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export interface Sugerencia {
  texto: string;
  fundamento: string;
}

export const GUIA_POR_NIVEL: Record<1 | 2 | 3, { titulo: string; sugerencias: Sugerencia[] }> = {
  1: {
    titulo: 'Nivel 1 — Apoyo universal (todo el curso)',
    sugerencias: [
      {
        texto: 'Trabajo cooperativo con roles rotativos y ubicación inclusiva en el aula (módulo Agrupamientos).',
        fundamento: 'Johnson & Johnson; Cohen & Lotan; van den Berg & Stoltz (2018).'
      },
      {
        texto: 'Normas de aula claras, enseñadas y reconocidas en positivo, en lugar de solo sancionar.',
        fundamento: 'Apoyo conductual positivo (PBIS) — Sugai & Horner (2002).'
      }
    ]
  },
  2: {
    titulo: 'Nivel 2 — Apoyo focalizado',
    sugerencias: [
      {
        texto:
          'Asignar un adulto referente que se encuentre con el alumno cada semana, revise asistencia, conducta y ' +
          'notas, y mantenga contacto con la familia (Check & Connect).',
        fundamento: 'Sinclair, Christenson, Evelo & Hurley (1998), Exceptional Children 65(1).'
      },
      {
        texto:
          'Tarjeta diaria con 2-3 metas de conducta: breve encuentro al llegar y al irse, con devolución de cada ' +
          'docente (Check-In/Check-Out).',
        fundamento: 'Hawken & Horner (2003), Journal of Behavioral Education.'
      },
      {
        texto: 'Fortalecer el vínculo con al menos un docente: el afecto y la cercanía docente-alumno sostienen el compromiso.',
        fundamento: 'Roorda, Koomen, Spilt & Oort (2011), Review of Educational Research 81(4).'
      },
      {
        texto: 'Si el área comprometida es Vínculos: tutoría entre pares, rol visible en el grupo y banco junto a un compañero que lo acepte.',
        fundamento: 'Topping (2005); Cohen & Lotan; van den Berg & Stoltz (2018).'
      }
    ]
  },
  3: {
    titulo: 'Nivel 3 — Apoyo intensivo e individual',
    sugerencias: [
      {
        texto:
          'Plan individual con 1-3 objetivos observables, responsables y fecha de revisión; medir el progreso ' +
          'cada 2 semanas y ajustar si no hay avance.',
        fundamento: 'Respuesta a la intervención (RTI/MTSS) — Fuchs & Fuchs (2006), Reading Research Quarterly.'
      },
      {
        texto: 'Entrevista con la familia para acordar estrategias compartidas casa-escuela.',
        fundamento: 'Hill & Tyson (2009), meta-análisis, Developmental Psychology 45(3).'
      },
      {
        texto: 'Evaluar barreras de aprendizaje y articular con profesionales externos cuando corresponda.',
        fundamento: 'Trabajo interdisciplinario del equipo de orientación.'
      }
    ]
  }
};
