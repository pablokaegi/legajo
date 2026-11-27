import { z } from 'zod';
import { servicioMoodleDePrueba } from './aula-rest.js';

// Contrato de la versión 1 del cuestionario. Moodle identifica los subtotales por nombre.
export const objetivosCiencias = ['Calcula caudales', 'Compara caudales', 'Reconoce una comparación justa'] as const;
const id = z.number().int().positive().safe();
const sinAvisos = z.object({ warnings: z.array(z.unknown()).max(0) });
const curso = sinAvisos.extend({
  quizzes: z.array(z.object({ id, course: id, coursemodule: id, name: z.string(), sumgrades: z.number().optional() }))
});
const intentos = sinAvisos.extend({
  attempts: z.array(z.object({
    id, userid: id, quiz: id, attempt: id, preview: z.number().int(),
    state: z.enum(['finished', 'submitted', 'inprogress', 'overdue', 'abandoned', 'notstarted']),
    timefinish: z.number().int().nonnegative(), sumgrades: z.number().nullable().optional(),
    gradeitemmarks: z.array(z.object({
      name: z.string(), grade: z.number().finite().nullable(), maxgrade: z.number().finite()
    })).optional()
  }))
});
type IntentoMoodle = z.infer<typeof intentos>['attempts'][number];

function evidenciaDeIntento(intento: IntentoMoodle) {
  const base = { id: intento.id, numero: intento.attempt, fecha: intento.timefinish || null };
  if (intento.state !== 'finished' || intento.sumgrades == null) {
    const estados = {
      submitted: 'Pendiente de corrección', finished: 'Pendiente de corrección', inprogress: 'En curso',
      overdue: 'Fuera de plazo', abandoned: 'Abandonado', notstarted: 'Sin iniciar'
    };
    return { ...base, estado: estados[intento.state], puntajes: null };
  }
  const subtotales = intento.gradeitemmarks ?? [];
  const puntajes = objetivosCiencias.map((nombre) => subtotales.find((item) => item.name === nombre));
  if (subtotales.length !== objetivosCiencias.length || puntajes.some((p) =>
    !p || p.maxgrade !== 1 || (p.grade !== null && (p.grade < 0 || p.grade > p.maxgrade))
  )) {
    return { ...base, estado: 'Revisar la configuración de los objetivos en Moodle', puntajes: null };
  }
  return { ...base, estado: 'Finalizado', puntajes: puntajes.map((p) => p?.grade ?? null) };
}

type Servicio = ReturnType<typeof servicioMoodleDePrueba>;

async function leerQuiz({ llamar, cursoId }: Servicio, quizId: number) {
  const datos = await llamar('mod_quiz_get_quizzes_by_courses', { 'courseids[0]': cursoId }, curso);
  const quiz = datos.quizzes.find((q) => q.id === quizId && q.course === cursoId);
  if (!quiz || quiz.sumgrades !== objetivosCiencias.length) {
    throw new Error('No se encontró el cuestionario de Ciencias con la configuración prevista.');
  }
  return quiz;
}

async function leerIntentos({ llamar }: Servicio, quizId: number, alumnoId: number) {
  try {
    const { attempts } = await llamar('mod_quiz_get_user_quiz_attempts', {
      quizid: quizId, userid: alumnoId, status: 'all', includepreviews: 0
    }, intentos);
    if (attempts.some((i) => i.userid !== alumnoId || i.quiz !== quizId || i.preview !== 0) ||
        new Set(attempts.map((i) => i.id)).size !== attempts.length ||
        new Set(attempts.map((i) => i.attempt)).size !== attempts.length) {
      throw new Error('Moodle devolvió intentos inconsistentes.');
    }
    return { errorLectura: false, intentos: attempts.map(evidenciaDeIntento).sort((a, b) => b.numero - a.numero) };
  } catch {
    return { errorLectura: true, intentos: [] };
  }
}

// El llamador ya validó la matrícula contra el padrón del curso autorizado.
export async function leerCuestionarioDeAlumno(entorno: Record<string, string | undefined>, cursoId: number, alumnoId: number) {
  const servicio = servicioMoodleDePrueba(entorno, 'MOODLE_AULA_QUIZ_TOKEN');
  const quizId = id.parse(Number(entorno.MOODLE_AULA_QUIZ_ID));
  if (cursoId !== servicio.cursoId) throw new Error('El curso de Ciencias no coincide.');
  const quiz = await leerQuiz(servicio, quizId);
  const resultados = await leerIntentos(servicio, quiz.id, id.parse(alumnoId));
  const url = new URL('mod/quiz/view.php?id=' + quiz.coursemodule, entorno.MOODLE_AULA_URL!.replace(/\/?$/, '/'));
  return { titulo: quiz.name, url: url.href, ...resultados };
}

export async function leerCuestionarioCiencias(entorno: Record<string, string | undefined>, quizId: number) {
  const servicio = servicioMoodleDePrueba(entorno, 'MOODLE_AULA_QUIZ_TOKEN');
  const [quiz, alumnos] = await Promise.all([leerQuiz(servicio, quizId), servicio.listarAlumnos(servicio.cursoId)]);
  async function leerEstudiante(alumno: { id: number; nombre: string }) {
    return { ...alumno, ...await leerIntentos(servicio, quiz.id, alumno.id) };
  }
  const estudiantes: Awaited<ReturnType<typeof leerEstudiante>>[] = [];
  for (let i = 0; i < alumnos.length; i += 4) {
    estudiantes.push(...await Promise.all(alumnos.slice(i, i + 4).map(leerEstudiante)));
  }
  return { titulo: quiz.name, objetivos: objetivosCiencias, estudiantes };
}
