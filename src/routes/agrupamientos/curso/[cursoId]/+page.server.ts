import { error } from '@sveltejs/kit';
import {
  listarSesionesDelCurso,
  listarVotos,
  modoDe,
  evaluacionesPorModo
} from '$lib/server/services/agrupamientos.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { veTodasLasSesiones } from '$lib/server/services/authz.js';
import { exigirStaff } from '$lib/server/agrupamientos/acceso.js';
import { construirGrafo } from '$lib/server/agrupamientos/grafo.js';
import { analizarRelacionesSociales } from '$lib/server/agrupamientos/analizar.js';
import type { PageServerLoad } from './$types';

interface Celda {
  recibidas: number;
  exposicion: number;
  mutuas: number;
  acompanar: boolean;
}

// Seguimiento longitudinal: cómo evoluciona cada alumno a lo largo de las
// votaciones del curso. Lo que más pesa es la baja aceptación SOSTENIDA, no la
// de una sola foto (Parker & Asher, 1987).
export const load: PageServerLoad = async ({ locals, params }) => {
  const usuarioId = await exigirStaff(locals.usuario);
  const cursoId = Number(params.cursoId);
  if (!Number.isInteger(cursoId) || cursoId <= 0) error(400, 'Curso inválido');

  const verTodas = await veTodasLasSesiones(usuarioId);
  const sesiones = (await listarSesionesDelCurso(cursoId)).filter(
    (s) => verTodas || s.createdBy === usuarioId
  );
  if (sesiones.length === 0) error(404, 'No hay sesiones de este curso que puedas ver.');

  const roster = (await listarAlumnosDeCurso(cursoId).catch(() => [])).map((u) => ({
    id: u.id,
    nombre: u.fullname
  }));

  const columnas: {
    id: number; titulo: string; fecha: string; modo: string; votos: number;
    participacion: number; reciprocidad: number; sinElecciones: number; acompanar: number;
    clima: string;
  }[] = [];
  const nombres = new Map<number, string>(roster.map((a) => [a.id, a.nombre]));
  const celdas = new Map<number, (Celda | null)[]>();

  for (const [k, s] of sesiones.entries()) {
    const votos = await listarVotos(s.id);
    const g = construirGrafo(votos, roster, modoDe(s));
    const an = analizarRelacionesSociales(g);
    const acomp = new Set(an?.paraAcompanar.map((p) => p.id) ?? []);
    columnas.push({
      id: s.id,
      titulo: s.titulo,
      fecha: String(s.fecha),
      modo: modoDe(s),
      votos: votos.length,
      participacion: an?.participacion ?? 0,
      reciprocidad: an?.porcentajeReciprocidad ?? 0,
      sinElecciones: an?.metricas.filter((m) => m.exposicion >= 3 && m.recibidas === 0).length ?? 0,
      acompanar: acomp.size,
      clima: an?.climaGrupal ?? 'sin_datos'
    });
    for (const m of an?.metricas ?? []) {
      if (!nombres.has(m.id)) nombres.set(m.id, m.nombre);
      const fila = celdas.get(m.id) ?? Array.from({ length: sesiones.length }, () => null);
      fila[k] = m.exposicion > 0
        ? { recibidas: m.recibidas, exposicion: m.exposicion, mutuas: m.mutuas, acompanar: acomp.has(m.id) }
        : null;
      celdas.set(m.id, fila);
    }
  }

  const alumnos = [...nombres.entries()]
    .map(([id, nombre]) => {
      const fila = celdas.get(id) ?? Array.from({ length: sesiones.length }, () => null);
      const conDatos = fila.filter((c): c is Celda => c != null);
      const ultimas = conDatos.slice(-3);
      const sostenida = ultimas.filter((c) => c.acompanar).length >= 2;
      const tasa = (c: Celda) => c.recibidas / Math.max(1, c.exposicion);
      let tendencia: 'sostenida' | 'mejora' | 'empeora' | null = null;
      if (sostenida) tendencia = 'sostenida';
      else if (conDatos.length >= 2) {
        const primera = conDatos[0];
        const ultima = conDatos[conDatos.length - 1];
        if (primera.acompanar && !ultima.acompanar && tasa(ultima) > tasa(primera)) tendencia = 'mejora';
        else if (!primera.acompanar && ultima.acompanar) tendencia = 'empeora';
      }
      return { id, nombre, fila, tendencia };
    })
    .sort((a, b) => {
      const peso = { sostenida: 0, empeora: 1, mejora: 2 } as Record<string, number>;
      return (peso[a.tendencia ?? ''] ?? 3) - (peso[b.tendencia ?? ''] ?? 3) || a.nombre.localeCompare(b.nombre, 'es');
    });

  return {
    cursoId,
    cursoNombre: sesiones[0].cursoNombre,
    columnas,
    alumnos,
    evaluaciones: await evaluacionesPorModo(sesiones.map((s) => s.id))
  };
};
