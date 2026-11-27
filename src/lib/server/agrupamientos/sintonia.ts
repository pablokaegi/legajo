// Sintonía docente (teacher attunement).
// Antes de ver los resultados, el docente anota quiénes cree que van a quedar
// menos y más elegidos; después se compara con la votación. Los docentes que
// "ven" la red del aula intervienen mejor (Farmer, Lines & Hamm, 2011), y el
// acuerdo docente-alumnos suele ser solo moderado (Neal et al., 2011): lo más
// valioso son los alumnos que el sociograma marca y no estaban en el radar.

import type { AlumnoRef } from './tipos.js';
import type { AnalisisSocial } from './analizar.js';

export interface Prediccion {
  menosElegidos: number[];
  masElegidos: number[];
  fecha: string;
}

export function parsePrediccion(raw: string | null | undefined): Prediccion | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    const ids = (x: unknown) =>
      Array.isArray(x) ? x.map(Number).filter((n) => Number.isInteger(n) && n > 0) : [];
    return { menosElegidos: ids(p?.menosElegidos), masElegidos: ids(p?.masElegidos), fecha: String(p?.fecha ?? '') };
  } catch {
    return null;
  }
}

export interface ComparacionGrupo {
  aciertos: AlumnoRef[];
  /** Los marcó la votación y no estaban en la predicción. */
  noDetectados: AlumnoRef[];
  /** Estaban en la predicción y la votación no los marcó. */
  sorpresas: AlumnoRef[];
  /** % de los marcados por la votación que el docente anticipó. */
  deteccion: number | null;
}

export interface Sintonia {
  menos: ComparacionGrupo;
  mas: ComparacionGrupo;
}

function comparar(predichos: number[], reales: number[], nombre: (id: number) => string): ComparacionGrupo {
  const p = new Set(predichos);
  const r = new Set(reales);
  const ref = (id: number) => ({ id, nombre: nombre(id) });
  return {
    aciertos: [...r].filter((id) => p.has(id)).map(ref),
    noDetectados: [...r].filter((id) => !p.has(id)).map(ref),
    sorpresas: [...p].filter((id) => !r.has(id)).map(ref),
    deteccion: r.size > 0 ? Math.round(([...r].filter((id) => p.has(id)).length / r.size) * 100) : null
  };
}

export function compararPrediccion(
  pred: Prediccion,
  analisis: AnalisisSocial,
  nombre: (id: number) => string
): Sintonia {
  return {
    menos: comparar(pred.menosElegidos, analisis.menosElegidos, nombre),
    mas: comparar(pred.masElegidos, analisis.referentes.map((r) => r.id), nombre)
  };
}
