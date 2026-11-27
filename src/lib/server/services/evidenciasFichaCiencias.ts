import { leerCuestionarioDeAlumno, objetivosCiencias } from '../moodle/cuestionario-ciencias.js';
import { libroCiencias } from '../moodle/libro-ciencias.js';

// Correspondencia didáctica del piloto. Los identificadores de paso sobreviven a cambios de título y de orden.
const pasosPorObjetivo: Record<typeof objetivosCiencias[number], readonly string[]> = {
  'Calcula caudales': ['leer', 'comparar'],
  'Compara caudales': ['comparar'],
  'Reconoce una comparación justa': ['justificar']
};

function estadoDelObjetivo(puntaje: number | null, sinPuntaje: string) {
  if (puntaje === null) return sinPuntaje;
  if (puntaje === 1) return 'Logrado en este intento';
  if (puntaje === 0) return 'Sin puntaje en este intento';
  return 'Logro parcial';
}

async function consultarLibro(entorno: Record<string, string | undefined>) {
  try {
    return await libroCiencias(entorno).leer();
  } catch {
    return null;
  }
}

// La ruta comprueba alcance de gabinete y matrícula activa antes de solicitar resultados personales.
export async function leerEvidenciasFichaCiencias(entorno: Record<string, string | undefined>, cursoId: number, alumnoId: number) {
  if (!Number.isSafeInteger(cursoId) || cursoId <= 0 || cursoId !== Number(entorno.MOODLE_AULA_CURSO_ID)) {
    throw new Error('El curso no corresponde al piloto de Ciencias.');
  }
  // Un recurso temporalmente fuera de servicio no impide consultar la otra fuente ni la ficha.
  const [libro, quiz] = await Promise.all([
    consultarLibro(entorno),
    leerCuestionarioDeAlumno(entorno, cursoId, alumnoId).catch(() => null)
  ]);
  const ultimo = quiz?.intentos[0];
  const evaluado = quiz?.intentos.find((i) => i.puntajes?.some((p) => p !== null));
  const estado = !quiz || quiz.errorLectura ? 'Lectura no disponible' : ultimo?.estado ?? 'Sin intento';
  const sinPuntaje = evaluado || ultimo?.puntajes ? 'Pendiente de corrección' : estado;
  return {
    libro: {
      titulo: libro?.actividad?.titulo ?? null, url: libro?.url ?? null, revision: libro?.revision || null,
      estado: !libro ? 'Lectura no disponible' : libro.actividad ? 'Publicado' : 'Sin publicar'
    },
    cuestionario: {
      titulo: quiz?.titulo ?? null, url: quiz?.url ?? null, estado,
      intento: evaluado ? { numero: evaluado.numero, fecha: evaluado.fecha } : null,
      ultimo: ultimo ? { numero: ultimo.numero, estado: ultimo.estado } : null
    },
    objetivos: objetivosCiencias.map((nombre, indice) => {
      const puntaje = evaluado?.puntajes?.[indice] ?? null;
      const capitulos = (libro?.capitulos ?? []).filter((capitulo) => pasosPorObjetivo[nombre].includes(capitulo.id));
      return {
        nombre, puntaje, estado: estadoDelObjetivo(puntaje, sinPuntaje),
        capitulos: capitulos.map(({ titulo, url, audio }) => ({ titulo, url, audio }))
      };
    })
  };
}
