import { moodle } from '../moodle/client.js';
import type { MoodleCourse, MoodleCategory, MoodleUser } from '../moodle/types.js';

export async function listarCursos(): Promise<MoodleCourse[]> {
  const cursos = await moodle.getCourses();
  // Filtrar el curso "site" (id=1) que Moodle incluye por defecto
  return cursos.filter(c => c.id !== 1 && c.visible !== 0);
}

const normalizar = (s: string) =>
  (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const esPreceptoria = (s: string) => normalizar(s).includes('precep');

/**
 * Cursos de Preceptoría: los que están en una categoría de Moodle cuyo nombre
 * contiene "Preceptoría" (incluye subcategorías) o cuyo nombre de curso la
 * menciona. Si no encuentra ninguno, devuelve todos (degradación segura).
 */
export async function listarCursosPreceptoria(): Promise<MoodleCourse[]> {
  const cursos = await listarCursos();

  let categorias: MoodleCategory[] = [];
  try {
    categorias = await moodle.getCategories();
  } catch {
    categorias = [];
  }

  // IDs de categorías de preceptoría + todas sus subcategorías descendientes
  const idsPreceptoria = new Set<number>();
  for (const c of categorias) {
    if (esPreceptoria(c.name)) idsPreceptoria.add(c.id);
  }
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (const c of categorias) {
      if (!idsPreceptoria.has(c.id) && idsPreceptoria.has(c.parent)) {
        idsPreceptoria.add(c.id);
        cambio = true;
      }
    }
  }

  const filtrados = cursos.filter(
    (c) =>
      idsPreceptoria.has(c.categoryid) ||
      esPreceptoria(c.fullname) ||
      esPreceptoria(c.shortname) ||
      esPreceptoria(c.displayname) ||
      esPreceptoria(c.categoryname ?? '')
  );

  return filtrados.length > 0 ? filtrados : cursos;
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
