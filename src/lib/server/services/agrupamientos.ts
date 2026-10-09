import { and, desc, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from '../db/index.js';
import { agrupamientoSesiones, agrupamientoVotos, agrupamientoGrupos } from '../db/schema.js';
import { analizarRelacionesSociales } from '../agrupamientos/analizar.js';
import { esPreceptorODirectivo, esDirectivoOAdmin } from './authz.js';
import type { Calificacion, VotoParsed, AlumnoRef } from '../agrupamientos/tipos.js';

// ─── Control de acceso ────────────────────────────────────────────────────────
// Los sociogramas son datos sensibles de menores (quién eligió o rechazó a quién).
// Ver: quien creó la sesión, o preceptoría/dirección/admin.
// Gestionar (votar, borrar, link público, cerrar): quien la creó, o dirección/admin.

export async function puedeVerSesion(usuarioId: number, sesion: { createdBy: number }) {
  if (sesion.createdBy === usuarioId) return true;
  return esPreceptorODirectivo(usuarioId);
}

export async function puedeGestionarSesion(usuarioId: number, sesion: { createdBy: number }) {
  if (sesion.createdBy === usuarioId) return true;
  return esDirectivoOAdmin(usuarioId);
}

// ─── Sesiones ─────────────────────────────────────────────────────────────────

export async function listarSesiones(
  filtros: { estado?: string; usuarioId?: number; verTodas?: boolean } = {}
) {
  const conditions = [];
  if (filtros.estado) conditions.push(eq(agrupamientoSesiones.estado, filtros.estado));
  // Sin visión total: solo las sesiones propias.
  if (!filtros.verTodas && filtros.usuarioId != null) {
    conditions.push(eq(agrupamientoSesiones.createdBy, filtros.usuarioId));
  }

  const sesiones = await db
    .select()
    .from(agrupamientoSesiones)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(agrupamientoSesiones.fecha), desc(agrupamientoSesiones.createdAt));

  // Conteo de votos en UNA consulta (antes era una por sesión).
  const conteos = await db
    .select({ sesionId: agrupamientoVotos.sesionId, n: sql<number>`count(*)` })
    .from(agrupamientoVotos)
    .groupBy(agrupamientoVotos.sesionId);
  const porSesion = new Map(conteos.map((c) => [c.sesionId, Number(c.n)]));

  return sesiones.map((s) => ({ ...s, cantidadVotos: porSesion.get(s.id) ?? 0 }));
}

export async function obtenerSesion(id: number) {
  const [row] = await db
    .select()
    .from(agrupamientoSesiones)
    .where(eq(agrupamientoSesiones.id, id))
    .limit(1);
  return row ?? null;
}

export async function obtenerSesionPorToken(token: string) {
  const [row] = await db
    .select()
    .from(agrupamientoSesiones)
    .where(eq(agrupamientoSesiones.votoToken, token))
    .limit(1);
  return row ?? null;
}

export async function crearSesion(
  createdBy: number,
  data: {
    cursoMoodleId: number;
    cursoNombre: string;
    titulo: string;
    fecha: string;
    cantidadEvaluar?: number;
    notas?: string;
  }
) {
  const [result] = await db.insert(agrupamientoSesiones).values({
    cursoMoodleId: data.cursoMoodleId,
    cursoNombre: data.cursoNombre,
    titulo: data.titulo,
    fecha: data.fecha,
    estado: 'abierta',
    cantidadEvaluar: data.cantidadEvaluar ?? 5,
    notas: data.notas ?? null,
    createdBy
  });
  return (result as { insertId: number }).insertId;
}

export async function editarSesion(
  id: number,
  data: Partial<{
    titulo: string;
    fecha: string;
    estado: string;
    cantidadEvaluar: number;
    votoToken: string | null;
    notas: string | null;
  }>
) {
  await db
    .update(agrupamientoSesiones)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(agrupamientoSesiones.id, id));
}

export async function eliminarSesion(id: number) {
  await db.delete(agrupamientoSesiones).where(eq(agrupamientoSesiones.id, id));
}

/** Genera (o regenera) el token público para votar desde el celular. */
export async function generarTokenVoto(id: number) {
  const token = randomUUID();
  await editarSesion(id, { votoToken: token });
  return token;
}

export async function quitarTokenVoto(id: number) {
  await editarSesion(id, { votoToken: null });
}

// ─── Votos ────────────────────────────────────────────────────────────────────

function parseCalificaciones(raw: string): Calificacion[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .map((c: { id: unknown; nombre: unknown; puntaje: unknown }) => ({
        id: Number(c.id),
        nombre: String(c.nombre ?? ''),
        puntaje: Number(c.puntaje)
      }))
      .filter(
        (c: Calificacion) =>
          Number.isInteger(c.id) && c.id > 0 && Number.isInteger(c.puntaje) && c.puntaje >= 1 && c.puntaje <= 5
      );
  } catch {
    return [];
  }
}

function esDuplicado(e: unknown): boolean {
  const err = e as { code?: string; cause?: { code?: string } } | null;
  return err?.code === 'ER_DUP_ENTRY' || err?.cause?.code === 'ER_DUP_ENTRY';
}

export async function listarVotos(sesionId: number): Promise<VotoParsed[]> {
  const rows = await db
    .select()
    .from(agrupamientoVotos)
    .where(eq(agrupamientoVotos.sesionId, sesionId))
    .orderBy(agrupamientoVotos.votanteNombre);

  return rows.map((r) => ({
    id: r.id,
    votanteMoodleId: r.votanteMoodleId,
    votanteNombre: r.votanteNombre,
    calificaciones: parseCalificaciones(r.calificaciones),
    bloqueadoMoodleId: r.bloqueadoMoodleId,
    bloqueadoNombre: r.bloqueadoNombre
  }));
}

/** Devuelve el id del votante de cada voto ya emitido en la sesión. */
export async function idsQueVotaron(sesionId: number): Promise<Set<number>> {
  const rows = await db
    .select({ votanteMoodleId: agrupamientoVotos.votanteMoodleId })
    .from(agrupamientoVotos)
    .where(eq(agrupamientoVotos.sesionId, sesionId));
  return new Set(rows.map((r) => r.votanteMoodleId));
}

/** Registra un voto nuevo. Lanza 'ya_voto' si el alumno ya votó. */
export async function registrarVoto(
  sesionId: number,
  voto: {
    votanteMoodleId: number;
    votanteNombre: string;
    calificaciones: Calificacion[];
    bloqueadoMoodleId?: number | null;
    bloqueadoNombre?: string | null;
  }
) {
  const [existente] = await db
    .select({ id: agrupamientoVotos.id })
    .from(agrupamientoVotos)
    .where(
      and(
        eq(agrupamientoVotos.sesionId, sesionId),
        eq(agrupamientoVotos.votanteMoodleId, voto.votanteMoodleId)
      )
    )
    .limit(1);
  if (existente) throw new Error('ya_voto');

  try {
    await db.insert(agrupamientoVotos).values({
      sesionId,
      votanteMoodleId: voto.votanteMoodleId,
      votanteNombre: voto.votanteNombre,
      calificaciones: JSON.stringify(voto.calificaciones),
      bloqueadoMoodleId: voto.bloqueadoMoodleId ?? null,
      bloqueadoNombre: voto.bloqueadoNombre ?? null
    });
  } catch (e) {
    // Dos envíos simultáneos del mismo alumno: el índice único corta el segundo.
    if (esDuplicado(e)) throw new Error('ya_voto');
    throw e;
  }
}

/** Borra un voto SOLO si pertenece a la sesión indicada. */
export async function eliminarVoto(sesionId: number, votoId: number) {
  await db
    .delete(agrupamientoVotos)
    .where(and(eq(agrupamientoVotos.id, votoId), eq(agrupamientoVotos.sesionId, sesionId)));
}

/**
 * Procesa y guarda un voto desde el FormData del kiosko. Lógica compartida
 * entre la votación interna y el link público con token.
 *
 * Nada de lo que manda el formulario se cree sin verificar contra la lista del
 * curso: el votante tiene que ser alumno del curso, solo puede calificar a los
 * compañeros que le tocaron, y los nombres se toman del padrón (no del form).
 */
export async function procesarVotoDesdeForm(
  sesionId: number,
  fd: FormData,
  ctx: { roster: AlumnoRef[]; cantidadEvaluar: number }
): Promise<{ ok: true } | { error: string }> {
  const porId = new Map(ctx.roster.map((a) => [a.id, a]));

  const votanteMoodleId = Number(String(fd.get('votanteMoodleId') ?? ''));
  const votante = Number.isInteger(votanteMoodleId) ? porId.get(votanteMoodleId) : undefined;
  if (!votante) return { error: 'Alumno inválido.' };

  const permitidos = new Set(
    asignarCompaneros(sesionId, votante.id, ctx.roster, ctx.cantidadEvaluar).map((a) => a.id)
  );

  let calificaciones: Calificacion[] = [];
  try {
    const arr = JSON.parse(String(fd.get('calificaciones') ?? '[]'));
    if (!Array.isArray(arr)) return { error: 'Datos de votación inválidos.' };
    const vistos = new Set<number>();
    for (const c of arr as Array<{ id?: unknown; puntaje?: unknown }>) {
      const id = Number(c?.id);
      const puntaje = Number(c?.puntaje);
      if (!permitidos.has(id) || vistos.has(id)) continue;
      if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) continue;
      vistos.add(id);
      calificaciones.push({ id, nombre: porId.get(id)!.nombre, puntaje });
    }
  } catch {
    return { error: 'Datos de votación inválidos.' };
  }
  if (calificaciones.length === 0) return { error: 'Tenés que calificar a tus compañeros.' };
  if (calificaciones.every((c) => c.puntaje === 1))
    return { error: 'No podés calificar a todos con la puntuación mínima.' };

  const bloqRaw = String(fd.get('bloqueadoMoodleId') ?? '').trim();
  const bloqueado = bloqRaw ? porId.get(Number(bloqRaw)) : undefined;
  if (bloqRaw && (!bloqueado || bloqueado.id === votante.id))
    return { error: 'Compañero inválido.' };

  try {
    await registrarVoto(sesionId, {
      votanteMoodleId: votante.id,
      votanteNombre: votante.nombre,
      calificaciones,
      bloqueadoMoodleId: bloqueado?.id ?? null,
      bloqueadoNombre: bloqueado?.nombre ?? null
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'ya_voto')
      return { error: 'Ese alumno ya emitió su votación.' };
    return { error: 'No se pudo guardar el voto. Intentá de nuevo.' };
  }
  return { ok: true };
}

export async function eliminarTodosLosVotos(sesionId: number) {
  await db.delete(agrupamientoVotos).where(eq(agrupamientoVotos.sesionId, sesionId));
}

// ─── Asignación aleatoria de compañeros a evaluar ─────────────────────────────

function prng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  const rand = prng(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Selecciona de forma determinística los `cantidad` compañeros que un alumno
 * debe evaluar. Determinística: si el alumno recarga la página obtiene los
 * mismos compañeros.
 */
export function asignarCompaneros(
  sesionId: number,
  votanteId: number,
  roster: AlumnoRef[],
  cantidad: number
): AlumnoRef[] {
  const otros = roster.filter((a) => a.id !== votanteId);
  const seed = sesionId * 100000 + votanteId;
  return shuffleSeeded(otros, seed).slice(0, Math.min(cantidad, otros.length));
}

/** Genera votos aleatorios realistas para los alumnos que aún no votaron. */
export async function generarVotosAleatorios(
  sesionId: number,
  roster: AlumnoRef[],
  cantidad: number
): Promise<number> {
  const yaVotaron = await idsQueVotaron(sesionId);
  let generados = 0;
  for (const alumno of roster) {
    if (yaVotaron.has(alumno.id)) continue;
    const companeros = asignarCompaneros(sesionId, alumno.id, roster, cantidad);
    if (companeros.length === 0) continue;

    const pesos = [10, 20, 40, 25, 5]; // distribución realista 1..5
    const calificaciones: Calificacion[] = companeros.map((c) => {
      const total = pesos.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      let puntaje = 5;
      for (let p = 0; p < 5; p++) {
        if (r < pesos[p]) {
          puntaje = p + 1;
          break;
        }
        r -= pesos[p];
      }
      return { id: c.id, nombre: c.nombre, puntaje };
    });

    const bloqueado = Math.random() < 0.2
      ? companeros[Math.floor(Math.random() * companeros.length)]
      : null;

    try {
      await registrarVoto(sesionId, {
        votanteMoodleId: alumno.id,
        votanteNombre: alumno.nombre,
        calificaciones,
        bloqueadoMoodleId: bloqueado?.id ?? null,
        bloqueadoNombre: bloqueado?.nombre ?? null
      });
      generados++;
    } catch {
      // ya_voto → saltar
    }
  }
  return generados;
}

// ─── Grupos guardados ─────────────────────────────────────────────────────────

export async function listarGrupos(sesionId: number) {
  const rows = await db
    .select()
    .from(agrupamientoGrupos)
    .where(eq(agrupamientoGrupos.sesionId, sesionId))
    .orderBy(desc(agrupamientoGrupos.createdAt));
  return rows.map((r) => {
    let grupos: AlumnoRef[][] = [];
    try {
      const parsed = JSON.parse(r.gruposJson);
      if (Array.isArray(parsed)) grupos = parsed;
    } catch {
      // una fila corrupta no debe tirar abajo toda la página
    }
    return { ...r, grupos };
  });
}

export async function guardarGrupos(
  sesionId: number,
  nombre: string,
  modo: string,
  grupos: AlumnoRef[][]
) {
  const [result] = await db.insert(agrupamientoGrupos).values({
    sesionId,
    nombre,
    modo,
    gruposJson: JSON.stringify(grupos)
  });
  return (result as { insertId: number }).insertId;
}

/** Borra una agrupación guardada SOLO si pertenece a la sesión indicada. */
export async function eliminarGrupos(sesionId: number, id: number) {
  await db
    .delete(agrupamientoGrupos)
    .where(and(eq(agrupamientoGrupos.id, id), eq(agrupamientoGrupos.sesionId, sesionId)));
}

// ─── Historial de agrupamientos de un alumno (para el legajo) ─────────────────

export interface HistorialAgrupamiento {
  sesionId: number;
  sesionTitulo: string;
  cursoNombre: string;
  fecha: string;
  modo: string;
  nombreAgrupacion: string;
  companeros: AlumnoRef[];
  notaPedagogica:
    | { tipo: 'acompanar'; observaciones: string[]; sugerencias: string[] }
    | { tipo: 'referente'; cualidades: string[] }
    | { tipo: null };
}

/**
 * Devuelve, para un alumno, el historial de agrupaciones guardadas en las que
 * participó: con qué compañeros quedó y la lectura pedagógica del sociograma
 * de esa sesión (si estaba bien valorado o si conviene acompañarlo).
 */
export async function obtenerHistorialAgrupamientosDeAlumno(
  alumnoMoodleId: number
): Promise<HistorialAgrupamiento[]> {
  const rows = await db
    .select({ grupo: agrupamientoGrupos, sesion: agrupamientoSesiones })
    .from(agrupamientoGrupos)
    .innerJoin(agrupamientoSesiones, eq(agrupamientoGrupos.sesionId, agrupamientoSesiones.id))
    .orderBy(desc(agrupamientoGrupos.createdAt));

  const entradas: HistorialAgrupamiento[] = [];
  const analisisCache = new Map<number, ReturnType<typeof analizarRelacionesSociales>>();

  for (const row of rows) {
    let grupos: AlumnoRef[][];
    try {
      grupos = JSON.parse(row.grupo.gruposJson);
    } catch {
      continue;
    }
    if (!Array.isArray(grupos)) continue;

    const miGrupo = grupos.find((g) => g.some((m) => Number(m.id) === alumnoMoodleId));
    if (!miGrupo) continue;
    const companeros = miGrupo
      .filter((m) => Number(m.id) !== alumnoMoodleId)
      .map((m) => ({ id: Number(m.id), nombre: String(m.nombre ?? '') }));

    // Lectura pedagógica del sociograma de esa sesión
    if (!analisisCache.has(row.sesion.id)) {
      const votos = await listarVotos(row.sesion.id);
      analisisCache.set(row.sesion.id, analizarRelacionesSociales(votos));
    }
    const analisis = analisisCache.get(row.sesion.id);
    let notaPedagogica: HistorialAgrupamiento['notaPedagogica'] = { tipo: null };
    if (analisis) {
      const acomp = analisis.paraAcompanar.find((a) => a.id === alumnoMoodleId);
      const refe = analisis.referentes.find((r) => r.id === alumnoMoodleId);
      if (acomp) {
        notaPedagogica = {
          tipo: 'acompanar',
          observaciones: acomp.observaciones,
          sugerencias: acomp.sugerencias
        };
      } else if (refe) {
        notaPedagogica = { tipo: 'referente', cualidades: refe.cualidades };
      }
    }

    entradas.push({
      sesionId: row.sesion.id,
      sesionTitulo: row.sesion.titulo,
      cursoNombre: row.sesion.cursoNombre,
      fecha: row.sesion.fecha,
      modo: row.grupo.modo,
      nombreAgrupacion: row.grupo.nombre,
      companeros,
      notaPedagogica
    });
  }
  return entradas;
}
