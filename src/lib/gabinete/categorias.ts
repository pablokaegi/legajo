// Clasificación fija de motivos del gabinete: todos derivan y registran con
// las mismas categorías, lo que permite contar, comparar cursos y períodos.
// Para agregar o renombrar una categoría, editar SOLO esta lista (los ids
// quedan guardados en los casos: no cambiar un id existente).

export interface Categoria {
  id: string;
  nombre: string;
  /** Requiere activar el protocolo institucional de inmediato. */
  urgente?: boolean;
}

export interface GrupoCategorias {
  grupo: string;
  color: string; // para gráficos
  items: Categoria[];
}

export const CATEGORIAS: GrupoCategorias[] = [
  {
    grupo: 'Asistencia',
    color: '#2563eb',
    items: [
      { id: 'inasistencias', nombre: 'Inasistencias reiteradas' },
      { id: 'llegadas_tarde', nombre: 'Llegadas tarde reiteradas' },
      { id: 'riesgo_abandono', nombre: 'Riesgo de abandono escolar' }
    ]
  },
  {
    grupo: 'Convivencia',
    color: '#dc2626',
    items: [
      { id: 'conflicto_pares', nombre: 'Conflicto entre pares' },
      { id: 'violencia_verbal', nombre: 'Violencia verbal entre pares' },
      { id: 'violencia_fisica', nombre: 'Violencia física' },
      { id: 'hostigamiento', nombre: 'Hostigamiento / bullying' },
      { id: 'ciberacoso', nombre: 'Ciberacoso' },
      { id: 'conflicto_adultos', nombre: 'Conflicto con adultos de la escuela' },
      { id: 'normas', nombre: 'Incumplimiento de normas de convivencia' }
    ]
  },
  {
    grupo: 'Aprendizaje',
    color: '#d97706',
    items: [
      { id: 'bajo_rendimiento', nombre: 'Bajo rendimiento académico' },
      { id: 'dificultades_especificas', nombre: 'Posibles dificultades específicas de aprendizaje' },
      { id: 'desmotivacion', nombre: 'Desmotivación / desinterés' },
      { id: 'no_entrega', nombre: 'No entrega tareas' }
    ]
  },
  {
    grupo: 'Socioemocional',
    color: '#7c3aed',
    items: [
      { id: 'aislamiento', nombre: 'Aislamiento social' },
      { id: 'ansiedad', nombre: 'Ansiedad o angustia' },
      { id: 'cambio_conducta', nombre: 'Cambio brusco de conducta' },
      { id: 'autolesiones', nombre: 'Autolesiones o ideación', urgente: true },
      { id: 'consumo', nombre: 'Consumo problemático' }
    ]
  },
  {
    grupo: 'Familia y contexto',
    color: '#0d9488',
    items: [
      { id: 'situacion_familiar', nombre: 'Situación familiar compleja' },
      { id: 'salud', nombre: 'Salud' },
      { id: 'vulneracion_derechos', nombre: 'Posible vulneración de derechos', urgente: true }
    ]
  }
];

export const CATEGORIA_POR_ID = new Map(
  CATEGORIAS.flatMap((g) => g.items.map((c) => [c.id, { ...c, grupo: g.grupo, color: g.color }] as const))
);

export const AVISO_URGENTE =
  'Situación que requiere activar el protocolo institucional de inmediato, sin esperar la revisión del caso: ' +
  'informar a dirección, contactar a la familia cuando corresponda y articular con salud o con el organismo de ' +
  'protección de derechos (Ley 26.061; ante riesgo suicida, Ley 27.130).';

/** Filtra y deduplica ids de categorías que vengan de un formulario o de la BD. */
export function categoriasValidas(ids: unknown[]): string[] {
  return [...new Set(ids.map(String))].filter((id) => CATEGORIA_POR_ID.has(id));
}

export function parseCategorias(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? categoriasValidas(arr) : [];
  } catch {
    return [];
  }
}

export const esUrgente = (ids: string[]) => ids.some((id) => CATEGORIA_POR_ID.get(id)?.urgente);

/** Categorías sugeridas a partir de las áreas en alerta del sistema de alerta temprana. */
export function categoriasDesdeAlerta(f: {
  asistencia: { nivel: string };
  conducta: { nivel: string };
  rendimiento: { nivel: string };
  vinculos: { nivel: string };
}): string[] {
  const c: string[] = [];
  const marcada = (n: string) => n === 'alerta' || n === 'atencion';
  if (marcada(f.asistencia.nivel)) c.push('inasistencias');
  if (marcada(f.conducta.nivel)) c.push('normas');
  if (marcada(f.rendimiento.nivel)) c.push('bajo_rendimiento');
  if (marcada(f.vinculos.nivel)) c.push('aislamiento');
  return c;
}
