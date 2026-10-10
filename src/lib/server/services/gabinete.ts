// Gabinete psicopedagógico: casos, intervenciones y datos de alerta temprana.
// El control de acceso (solo gabinete/admin) está en las rutas; acá no se
// asume nada sobre quién llama.

import { and, desc, eq, inArray, lt, ne, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  gabineteCasos,
  gabineteIntervenciones,
  usuarios,
  roles,
  faltas,
  faltasAlumnos,
  amonestaciones,
  observaciones
} from '../db/schema.js';
import { obtenerNotasMoodle } from './perfilAlumnos.js';
import { listarSesionesDelCurso, listarVotos, modoDe } from './agrupamientos.js';
import { construirGrafo } from '../agrupamientos/grafo.js';
import { analizarRelacionesSociales } from '../agrupamientos/analizar.js';
import { evaluarAlumno, type DatosAlumnoAlerta, type FilaAlerta } from '../gabinete/alerta.js';
import { DIAS_REVISION, fechaMasDias } from '../gabinete/guia.js';
import { categoriasValidas, parseCategorias } from '../../gabinete/categorias.js';
import type { AlumnoRef } from '../agrupamientos/tipos.js';

// ─── Casos ────────────────────────────────────────────────────────────────────

export async function crearCaso(data: {
  alumnoMoodleId: number;
  alumnoNombre: string;
  cursoMoodleId: number | null;
  cursoNombre: string | null;
  motivo: string;
  categorias?: string[];
  fortalezas?: string | null;
  nivel?: number;
  origen: 'derivacion' | 'alerta' | 'gabinete';
  estado?: string;
  derivadoPor: number;
}): Promise<number> {
  const nivel = data.nivel ?? 2;
  const [res] = await db.insert(gabineteCasos).values({
    alumnoMoodleId: data.alumnoMoodleId,
    alumnoNombre: data.alumnoNombre,
    cursoMoodleId: data.cursoMoodleId,
    cursoNombre: data.cursoNombre,
    estado: data.estado ?? 'derivado',
    nivel,
    motivo: data.motivo,
    categoriasJson: JSON.stringify(categoriasValidas(data.categorias ?? [])),
    fortalezas: data.fortalezas ?? null,
    origen: data.origen,
    derivadoPor: data.derivadoPor,
    proximaRevision: fechaMasDias(DIAS_REVISION[nivel] ?? 28)
  });
  return Number((res as { insertId: number }).insertId);
}

/** Caso abierto (no cerrado) más reciente del alumno, si existe. */
export async function casoAbiertoDe(alumnoMoodleId: number) {
  const [c] = await db
    .select()
    .from(gabineteCasos)
    .where(and(eq(gabineteCasos.alumnoMoodleId, alumnoMoodleId), ne(gabineteCasos.estado, 'cerrado')))
    .orderBy(desc(gabineteCasos.createdAt))
    .limit(1);
  return c ?? null;
}

/**
 * Derivación de un docente/preceptor. Si el alumno ya tiene un caso abierto,
 * se suma al registro de ese caso (no se duplica).
 */
export async function registrarDerivacion(data: {
  alumnoMoodleId: number;
  alumnoNombre: string;
  cursoMoodleId: number | null;
  cursoNombre: string | null;
  motivo: string;
  categorias: string[];
  fortalezas: string | null;
  derivadoPor: number;
}): Promise<{ casoId: number; nuevo: boolean }> {
  const abierto = await casoAbiertoDe(data.alumnoMoodleId);
  if (abierto) {
    await agregarIntervencion({
      casoId: abierto.id,
      tipo: 'derivacion',
      fecha: new Date().toISOString().slice(0, 10),
      descripcion: data.motivo + (data.fortalezas ? `\n\nFortalezas señaladas: ${data.fortalezas}` : ''),
      acuerdos: null,
      visibleFamilia: false,
      autorId: data.derivadoPor
    });
    // Las categorías nuevas se suman a las del caso.
    const union = categoriasValidas([...parseCategorias(abierto.categoriasJson), ...data.categorias]);
    await actualizarCaso(abierto.id, { categoriasJson: JSON.stringify(union) });
    return { casoId: abierto.id, nuevo: false };
  }
  const casoId = await crearCaso({ ...data, origen: 'derivacion', estado: 'derivado', nivel: 2 });
  return { casoId, nuevo: true };
}

export async function listarCasos(filtros: { estado?: string; nivel?: number; alumnoMoodleId?: number } = {}) {
  const conds = [];
  if (filtros.estado === 'abiertos') conds.push(ne(gabineteCasos.estado, 'cerrado'));
  else if (filtros.estado) conds.push(eq(gabineteCasos.estado, filtros.estado));
  if (filtros.nivel) conds.push(eq(gabineteCasos.nivel, filtros.nivel));
  if (filtros.alumnoMoodleId) conds.push(eq(gabineteCasos.alumnoMoodleId, filtros.alumnoMoodleId));
  return db
    .select({
      caso: gabineteCasos,
      responsable: usuarios.nombre
    })
    .from(gabineteCasos)
    .leftJoin(usuarios, eq(gabineteCasos.responsableId, usuarios.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(gabineteCasos.nivel), gabineteCasos.proximaRevision, desc(gabineteCasos.createdAt));
}

export async function obtenerCaso(id: number) {
  const [row] = await db
    .select({ caso: gabineteCasos, derivadoPorNombre: usuarios.nombre })
    .from(gabineteCasos)
    .innerJoin(usuarios, eq(gabineteCasos.derivadoPor, usuarios.id))
    .where(eq(gabineteCasos.id, id))
    .limit(1);
  if (!row) return null;
  const intervenciones = await db
    .select({ i: gabineteIntervenciones, autor: usuarios.nombre })
    .from(gabineteIntervenciones)
    .innerJoin(usuarios, eq(gabineteIntervenciones.autorId, usuarios.id))
    .where(eq(gabineteIntervenciones.casoId, id))
    .orderBy(desc(gabineteIntervenciones.fecha), desc(gabineteIntervenciones.createdAt));
  return { ...row, intervenciones };
}

export async function actualizarCaso(
  id: number,
  data: Partial<{
    estado: string;
    nivel: number;
    responsableId: number | null;
    proximaRevision: string | null;
    motivo: string;
    categoriasJson: string;
    fortalezas: string | null;
  }>
) {
  const extra: { cerradoAt?: Date | null } = {};
  if (data.estado === 'cerrado') extra.cerradoAt = new Date();
  else if (data.estado) extra.cerradoAt = null;
  await db
    .update(gabineteCasos)
    .set({ ...data, ...extra, updatedAt: new Date() })
    .where(eq(gabineteCasos.id, id));
}

export async function agregarIntervencion(data: {
  casoId: number;
  tipo: string;
  fecha: string;
  descripcion: string;
  acuerdos: string | null;
  visibleFamilia: boolean;
  autorId: number;
}) {
  await db.insert(gabineteIntervenciones).values(data);
  await db.update(gabineteCasos).set({ updatedAt: new Date() }).where(eq(gabineteCasos.id, data.casoId));
}

/** Personas que pueden ser responsables de un caso (gabinete y admin). */
export async function listarEquipoGabinete() {
  const rows = await db
    .selectDistinct({ id: usuarios.id, nombre: usuarios.nombre })
    .from(usuarios)
    .innerJoin(roles, eq(roles.usuarioId, usuarios.id))
    .where(and(inArray(roles.rol, ['gabinete', 'admin']), eq(usuarios.activo, true)))
    .orderBy(usuarios.nombre);
  return rows;
}

export async function resumenTablero() {
  const hoy = new Date().toISOString().slice(0, 10);
  const [porEstado, vencidas, nivel3] = await Promise.all([
    db
      .select({ estado: gabineteCasos.estado, n: sql<number>`count(*)` })
      .from(gabineteCasos)
      .groupBy(gabineteCasos.estado),
    db
      .select({ caso: gabineteCasos })
      .from(gabineteCasos)
      .where(and(ne(gabineteCasos.estado, 'cerrado'), lt(gabineteCasos.proximaRevision, hoy)))
      .orderBy(gabineteCasos.proximaRevision),
    db
      .select({ n: sql<number>`count(*)` })
      .from(gabineteCasos)
      .where(and(ne(gabineteCasos.estado, 'cerrado'), eq(gabineteCasos.nivel, 3)))
  ]);
  const conteo: Record<string, number> = {};
  for (const r of porEstado) conteo[r.estado] = Number(r.n);
  return {
    conteo,
    abiertos: Object.entries(conteo).filter(([e]) => e !== 'cerrado').reduce((s, [, n]) => s + n, 0),
    vencidas: vencidas.map((v) => v.caso),
    nivel3: Number(nivel3[0]?.n ?? 0)
  };
}

/** Casos abiertos por alumno (para marcar en el tablero de alerta). */
export async function casosAbiertosPorAlumno(alumnoIds: number[]): Promise<Map<number, number>> {
  const res = new Map<number, number>();
  if (alumnoIds.length === 0) return res;
  const rows = await db
    .select({ id: gabineteCasos.id, alumno: gabineteCasos.alumnoMoodleId })
    .from(gabineteCasos)
    .where(and(inArray(gabineteCasos.alumnoMoodleId, alumnoIds), ne(gabineteCasos.estado, 'cerrado')));
  for (const r of rows) res.set(r.alumno, r.id);
  return res;
}

// ─── Datos para la alerta temprana de un curso ───────────────────────────────

/** Inicio del ciclo lectivo (1 de marzo; antes de marzo, el del año anterior). */
function inicioCiclo(hoy = new Date()): Date {
  const anio = hoy.getMonth() >= 2 ? hoy.getFullYear() : hoy.getFullYear() - 1;
  return new Date(anio, 2, 1);
}

const DIA = 24 * 60 * 60 * 1000;
const aFecha = (v: unknown): Date => (v instanceof Date ? v : new Date(String(v)));

/** Lectura social de las últimas votaciones por nominación del curso. */
async function lecturaSocial(cursoId: number, roster: AlumnoRef[]) {
  const sesiones = (await listarSesionesDelCurso(cursoId)).filter((s) => modoDe(s) === 'nominacion');
  const ultimas = sesiones.slice(-3);
  const lecturas: {
    acomp: Set<number>;
    metricas: Map<number, { recibidas: number; exposicion: number; rechazos: number }>;
  }[] = [];
  for (const s of ultimas) {
    const votos = await listarVotos(s.id);
    if (votos.length === 0) continue;
    const an = analizarRelacionesSociales(construirGrafo(votos, roster, 'nominacion'));
    if (!an) continue;
    lecturas.push({
      acomp: new Set(an.paraAcompanar.map((p) => p.id)),
      metricas: new Map(
        an.metricas.map((m) => [m.id, { recibidas: m.recibidas, exposicion: m.exposicion, rechazos: m.rechazos }])
      )
    });
  }
  return lecturas;
}

export async function alertaDelCurso(
  cursoId: number,
  roster: AlumnoRef[],
  opciones: { conNotas: boolean }
): Promise<{ filas: FilaAlerta[]; hayVotacion: boolean }> {
  const ids = roster.map((a) => a.id);
  if (ids.length === 0) return { filas: [], hayVotacion: false };

  const hoy = new Date();
  const hace30 = new Date(hoy.getTime() - 30 * DIA);
  const hace60 = new Date(hoy.getTime() - 60 * DIA);
  const hace90 = new Date(hoy.getTime() - 90 * DIA).toISOString().slice(0, 10);
  const ciclo = inicioCiclo(hoy);

  const [falRows, amoRows, obsRows, social, notas] = await Promise.all([
    db
      .select({ alumno: faltasAlumnos.alumnoMoodleId, fecha: faltas.fecha, tipo: faltas.tipo })
      .from(faltasAlumnos)
      .innerJoin(faltas, eq(faltasAlumnos.faltaId, faltas.id))
      .where(inArray(faltasAlumnos.alumnoMoodleId, ids)),
    db
      .select({ alumno: amonestaciones.alumnoMoodleId, fecha: amonestaciones.fecha, gravedad: amonestaciones.gravedad })
      .from(amonestaciones)
      .where(inArray(amonestaciones.alumnoMoodleId, ids)),
    db
      .select({
        alumno: observaciones.alumnoMoodleId,
        fecha: observaciones.fecha,
        actitud: observaciones.actitud,
        participacion: observaciones.participacion,
        tarea: observaciones.tareaCompleta
      })
      .from(observaciones)
      .where(inArray(observaciones.alumnoMoodleId, ids)),
    lecturaSocial(cursoId, roster),
    opciones.conNotas ? obtenerNotasMoodle(cursoId, ids) : Promise.resolve(null)
  ]);

  const prom = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);
  const ultima = social[social.length - 1];

  const filas = roster.map((a) => {
    const f = falRows.filter((x) => x.alumno === a.id);
    const aus = f.filter((x) => x.tipo === 'ausente');
    const am = amoRows.filter((x) => x.alumno === a.id && aFecha(x.fecha) >= hace60);
    const ob = obsRows.filter((x) => x.alumno === a.id && x.fecha >= hace90);
    const tareas = ob.map((x) => x.tarea).filter((t): t is boolean => t != null);
    const m = ultima?.metricas.get(a.id);
    const vecesAcomp = social.slice(-3).filter((l) => l.acomp.has(a.id)).length;

    const datos: DatosAlumnoAlerta = {
      id: a.id,
      nombre: a.nombre,
      ausenciasRecientes: aus.filter((x) => aFecha(x.fecha) >= hace30).length,
      ausenciasCiclo: aus.filter((x) => aFecha(x.fecha) >= ciclo).length,
      retrasosRecientes: f.filter((x) => x.tipo === 'retraso' && aFecha(x.fecha) >= hace30).length,
      amonestaciones: {
        leve: am.filter((x) => x.gravedad === 'leve').length,
        mediana: am.filter((x) => x.gravedad === 'mediana').length,
        grave: am.filter((x) => x.gravedad === 'grave').length
      },
      actitud: prom(ob.map((x) => x.actitud).filter((n): n is number => n != null)),
      participacion: prom(ob.map((x) => x.participacion).filter((n): n is number => n != null)),
      tareasOk: tareas.length ? Math.round((tareas.filter(Boolean).length / tareas.length) * 100) : null,
      nota: notas ? notas.get(a.id) ?? null : undefined,
      social: m
        ? {
            recibidas: m.recibidas,
            exposicion: m.exposicion,
            rechazos: m.rechazos,
            acompanar: ultima!.acomp.has(a.id),
            sostenida: vecesAcomp >= 2
          }
        : null
    };
    return evaluarAlumno(datos);
  });

  filas.sort((x, y) => y.puntos - x.puntos || x.nombre.localeCompare(y.nombre, 'es'));
  return { filas, hayVotacion: social.length > 0 };
}
