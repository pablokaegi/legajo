import { moodle } from '../moodle/client.js';
import type { MoodleCourse, MoodleUser } from '../moodle/types.js';

export async function listarCursos(): Promise<MoodleCourse[]> {
  const cursos = await moodle.getCourses();
  // Filtrar el curso "site" (id=1) que Moodle incluye por defecto
  return cursos.filter(c => c.id !== 1 && c.visible !== 0);
}

export async function listarAlumnosDeCurso(cursoId: number): Promise<MoodleUser[]> {
  const usuarios = await moodle.getEnrolledUsers(cursoId);

  // Filtrar solo roles de estudiante (roleid 5 = student en Moodle por defecto)
  // Si no tiene roles definidos, devolver todos (comportamiento seguro)
  const soloAlumnos = usuarios.filter(u => {
    if (!u.roles || u.roles.length === 0) return true;
    return u.roles.some(r => r.shortname === 'student');
  });

  return soloAlumnos.sort((a, b) => a.lastname.localeCompare(b.lastname));
}

export async function buscarAlumnos(query: string): Promise<MoodleUser[]> {
  if (query.trim().length < 2) return [];
  return moodle.searchUsers(query.trim());
}
