import { z } from 'zod';
import { servicioMoodleDePrueba } from './aula-rest.js';

const id = z.number().int().positive().safe();
const intento = z.number().int().nonnegative().safe();
const sinAvisos = z.object({ warnings: z.array(z.unknown()).max(0).optional() });

const destinos = sinAvisos.extend({
  courses: z.array(z.object({
    id,
    assignments: z.array(z.object({
      id,
      cmid: id,
      course: id,
      name: z.string(),
      grade: z.number().finite(),
      nosubmissions: z.number(),
      teamsubmission: z.number(),
      blindmarking: z.number(),
      markingworkflow: z.number(),
      attemptreopenmethod: z.string(),
      maxattempts: z.number(),
      configs: z.array(z.object({ plugin: z.string(), subtype: z.string(), name: z.string(), value: z.string() }))
    }))
  }))
});

const estadoTarea = sinAvisos.extend({
  lastattempt: z.object({
    submission: z.object({ attemptnumber: intento }).optional()
  }).optional(),
  feedback: z.object({
    grade: z.object({
      assignment: id.optional(),
      userid: id,
      attemptnumber: intento,
      grade: z.string().regex(/^-?\d+(\.\d+)?$/)
    }).optional(),
    plugins: z.array(z.object({
      type: z.string(),
      editorfields: z.array(z.object({
        name: z.string(),
        text: z.string()
      })).optional()
    })).optional()
  }).optional()
});

const libro = sinAvisos.extend({
  usergrades: z.array(z.object({
    courseid: id,
    userid: id,
    gradeitems: z.array(z.object({
      itemtype: z.string(),
      itemmodule: z.string().nullable(),
      iteminstance: z.number().int().nullable(),
      itemnumber: z.number().int().nullable(),
      locked: z.boolean().optional(),
      gradeislocked: z.boolean().optional(),
      gradeisoverridden: z.boolean().optional(),
      graderaw: z.number().finite().nullable().optional()
    }))
  }))
});

export interface TareaMoodleAula {
  id: number;
  cursoId: number;
  cmid: number;
  nombre: string;
  calificacionMaxima: number;
}

export interface NotaMoodleAula {
  nota: number | null;
  intento: number;
  feedback: string | null;
  notaLibro: number | null;
  bloqueada: boolean;
  sobrescrita: boolean;
}

interface PublicacionMoodleAula {
  cursoId: number;
  tareaId: number;
  alumnoId: number;
  nota: number;
  intento: number;
  feedback: string;
}

export function crearMoodleAulaConEntorno(entorno: Record<string, string | undefined>) {
  const { cursoId: cursoPermitido, llamar, listarAlumnos } = servicioMoodleDePrueba(entorno, 'MOODLE_AULA_TOKEN');
  const tarea = id.safeParse(Number(entorno.MOODLE_AULA_TAREA_ID));
  if (!tarea.success) throw new Error('Falta el identificador de la Tarea de prueba.');
  const tareaPermitida = tarea.data;

  function verificarDestino(cursoId: number, tareaId = tareaPermitida) {
    if (cursoId !== cursoPermitido || tareaId !== tareaPermitida) {
      throw new Error('Ese curso o esa Tarea no están habilitados para el piloto.');
    }
  }

  async function obtenerTarea(cursoId: number, tareaId: number): Promise<TareaMoodleAula> {
    verificarDestino(cursoId, tareaId);
    const { courses } = await llamar('mod_assign_get_assignments', {
      'courseids[0]': cursoId,
      'capabilities[0]': 'mod/assign:grade'
    }, destinos);
    const tarea = courses.find((curso) => curso.id === cursoId)?.assignments
      .find((item) => item.id === tareaId && item.course === cursoId);
    if (!tarea) {
      throw new Error('No encontré la Tarea habilitada en el curso de prueba.');
    }
    if (
      tarea.grade <= 0 || tarea.nosubmissions !== 1 || tarea.teamsubmission !== 0 || tarea.blindmarking !== 0 ||
      tarea.markingworkflow !== 0 || (tarea.attemptreopenmethod !== 'none' && tarea.maxattempts !== 1)
    ) {
      throw new Error('Configurá una Tarea individual con nota numérica y sin entregas, nuevos intentos ni flujo de corrección.');
    }
    if (!tarea.configs.some((config) =>
      config.plugin === 'comments' && config.subtype === 'assignfeedback' &&
      config.name === 'enabled' && config.value === '1'
    )) {
      throw new Error('Habilitá los comentarios de retroalimentación en la Tarea de prueba.');
    }
    return {
      id: tarea.id, cursoId, cmid: tarea.cmid, nombre: tarea.name, calificacionMaxima: tarea.grade
    };
  }

  async function leerNota(tareaId: number, alumnoId: number): Promise<NotaMoodleAula> {
    verificarDestino(cursoPermitido, tareaId);
    id.parse(alumnoId);
    const [estado, informe] = await Promise.all([
      llamar('mod_assign_get_submission_status', {
        assignid: tareaId, userid: alumnoId, moodlewssettingraw: 1
      }, estadoTarea),
      llamar('gradereport_user_get_grade_items', {
        courseid: cursoPermitido, userid: alumnoId
      }, libro)
    ]);
    const nota = estado.feedback?.grade;
    if (nota && (nota.userid !== alumnoId || (nota.assignment !== undefined && nota.assignment !== tareaId))) {
      throw new Error('Moodle devolvió una nota que no coincide con el alumno o la Tarea.');
    }
    const item = informe.usergrades
      .find((registro) => registro.userid === alumnoId && registro.courseid === cursoPermitido)
      ?.gradeitems.find((item) =>
        item.itemtype === 'mod' && item.itemmodule === 'assign' &&
        item.iteminstance === tareaId && item.itemnumber === 0
      );
    if (!item) {
      throw new Error('No encontré el ítem de esa Tarea en el libro de Moodle.');
    }
    const comentario = estado.feedback?.plugins
      ?.find((plugin) => plugin.type === 'comments')
      ?.editorfields?.find((campo) => campo.name === 'comments')?.text;
    const valor = nota ? Number(nota.grade) : -1;

    return {
      nota: valor >= 0 ? valor : null,
      intento: nota?.attemptnumber ?? estado.lastattempt?.submission?.attemptnumber ?? 0,
      feedback: comentario?.replace(/\r\n?/g, '\n').trim() || null,
      notaLibro: item.graderaw ?? null,
      bloqueada: item.locked === true || item.gradeislocked === true,
      sobrescrita: item.gradeisoverridden === true
    };
  }

  async function publicarNota(datos: PublicacionMoodleAula): Promise<void> {
    const tarea = await obtenerTarea(datos.cursoId, datos.tareaId);
    id.parse(datos.alumnoId);
    if (datos.intento !== 0) {
      throw new Error('El piloto solo admite el primer intento de la Tarea.');
    }
    if (!Number.isFinite(datos.nota) || datos.nota < 0 || datos.nota > tarea.calificacionMaxima) {
      throw new Error('La nota no entra en el rango de la Tarea de Moodle.');
    }
    const feedback = datos.feedback.replace(/\r\n?/g, '\n').trim();
    await llamar('mod_assign_save_grade', {
      assignmentid: tarea.id,
      userid: datos.alumnoId,
      grade: datos.nota,
      attemptnumber: datos.intento,
      addattempt: 0,
      workflowstate: '',
      applytoall: 0,
      // Enviar el vacío explícitamente permite retirar una devolución anterior.
      'plugindata[assignfeedbackcomments_editor][text]': feedback,
      'plugindata[assignfeedbackcomments_editor][format]': 2 // FORMAT_PLAIN.
    }, z.null());
  }

  return { obtenerTarea, listarAlumnos, leerNota, publicarNota };
}
