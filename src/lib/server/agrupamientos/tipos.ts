// Tipos compartidos del módulo Agrupamientos / Sociograma.

/** Una calificación que un alumno le dio a un compañero (1-5). */
export interface Calificacion {
  id: number;        // alumnoMoodleId del evaluado
  nombre: string;
  puntaje: number;   // 1-5
}

/** Referencia mínima a un alumno. */
export interface AlumnoRef {
  id: number;
  nombre: string;
}

/** Un voto deserializado, listo para los algoritmos. */
export interface VotoParsed {
  id?: number;                       // id de la fila en BD (presente al leer de la BD)
  votanteMoodleId: number;
  votanteNombre: string;
  calificaciones: Calificacion[];
  bloqueadoMoodleId: number | null;
  bloqueadoNombre: string | null;
}
