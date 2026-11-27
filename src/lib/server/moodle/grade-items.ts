import type { MoodleGradeItem } from './types.js';

export type MoodleGradeItemRest = Omit<MoodleGradeItem, 'graderaw' | 'gradepercent' | 'gradeformatted' | 'feedback'> & {
  graderaw?: number | null;
  gradepercent?: number | null;
  gradeformatted?: string;
  feedback?: string | null;
  scaleid?: number;
};

export function normalizarItemCalificacion(item: MoodleGradeItemRest): MoodleGradeItem {
  const nota = typeof item.graderaw === 'number' && Number.isFinite(item.graderaw)
    ? item.graderaw
    : null;
  // Moodle 5.1 ofrece nota y rango numéricos. El porcentaje formateado puede
  // incluir el separador decimal del idioma del usuario y no sirve como dato.
  const rango = item.grademax - item.grademin;
  const porcentaje = nota !== null && !item.scaleid && Number.isFinite(rango) && rango > 0
    ? ((nota - item.grademin) * 100) / rango
    : null;

  return {
    id: item.id,
    itemname: item.itemname,
    itemtype: item.itemtype,
    itemmodule: item.itemmodule,
    grademin: item.grademin,
    grademax: item.grademax,
    graderaw: nota,
    gradepercent: nota !== null && !item.scaleid && typeof item.gradepercent === 'number' && Number.isFinite(item.gradepercent)
      ? item.gradepercent
      : porcentaje,
    gradeformatted: item.gradeformatted ?? '',
    feedback: item.feedback ?? null
  };
}
