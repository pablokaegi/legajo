export const VERSION_RUBRICA_ORAL = 2;
export const ORAL_CIENCIAS = {
  titulo: '¿Qué canilla consume más agua?',
  objetivo: 'Comparar caudales y justificar una decisión con datos y unidades.',
  consigna: 'La canilla A llenó 12 litros en 3 minutos. La B llenó 18 litros en 3 minutos. Explicá cuál entrega más agua por minuto y qué condición mantendrías igual al compararlas.',
  criterios: [
    { id: 'caudales', nombre: 'Compara los caudales', niveles: [
      'La respuesta falla en ambos cálculos y en la comparación.',
      'Acierta una parte de los cálculos o de la comparación.',
      'Obtiene 4 para A y 6 para B, o valores equivalentes, e identifica a B como la de mayor caudal.'
    ] },
    { id: 'unidades', nombre: 'Usa las unidades', niveles: [
      'Omite las unidades o usa unidades incompatibles en ambos resultados.',
      'Usa una unidad de caudal correcta en uno de los dos resultados.',
      'Expresa ambos resultados en L/min o en unidades equivalentes.'
    ] },
    { id: 'justificacion', nombre: 'Justifica la decisión', niveles: [
      'La explicación carece de datos pertinentes y de una condición comparable.',
      'Menciona datos pertinentes o una condición comparable.',
      'Fundamenta con los datos y señala una condición comparable, como la apertura.'
    ] }
  ]
} as const;

export const NIVELES_ORAL = [0, 1, 2] as const;
export const APOYOS_ORAL = ['lectura', 'guia_visual', 'comunicador', 'tiempo_adicional', 'otro'] as const;
export type ApoyoOral = (typeof APOYOS_ORAL)[number];
export const NOMBRES_APOYO_ORAL: Record<ApoyoOral, string> = {
  lectura: 'Lectura de la consigna',
  guia_visual: 'Guía visual por pasos',
  comunicador: 'Comunicador o tablero',
  tiempo_adicional: 'Tiempo adicional',
  otro: 'Otro apoyo'
};

export const ESTADOS_ORAL = { evaluado: 'Evaluado', ausente: 'Ausente', sin_observar: 'Sin observar' } as const;
export type EstadoOral = keyof typeof ESTADOS_ORAL;
export type CriterioId = (typeof ORAL_CIENCIAS.criterios)[number]['id'];
export type RúbricaOral = Record<CriterioId, number | null>;

export function notaOral(criterios: RúbricaOral): number | null {
  const valores = ORAL_CIENCIAS.criterios.map(({ id }) => criterios[id]);
  if (valores.some((valor) => valor !== 0 && valor !== 1 && valor !== 2)) return null;
  const total = valores.reduce<number>((suma, valor) => suma + (valor ?? 0), 0);
  return Math.round(total * 1000 / 6) / 100;
}
