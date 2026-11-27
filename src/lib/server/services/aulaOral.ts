import { randomUUID } from 'node:crypto';
import { and, desc, eq, isNull, lte, or, sql } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';
import { aulaOrales, aulaPublicaciones } from '$lib/server/db/schema.js';
import { VERSION_RUBRICA_ORAL, notaOral, type ApoyoOral, type EstadoOral, type RúbricaOral } from '$lib/aula/oral.js';
import { registrarAccion } from './audit.js';
import type { crearMoodleAula } from '$lib/server/moodle/aula.js';

type Oral = typeof aulaOrales.$inferSelect;
type Publicacion = typeof aulaPublicaciones.$inferSelect;
type MoodleAula = ReturnType<typeof crearMoodleAula>;
type NotaMoodle = Awaited<ReturnType<MoodleAula['leerNota']>>;
type Destino = { cursoId: number; tareaId: number };
type Revision = { alumnoId: number; revision: number };
type Registro = Revision & RúbricaOral & {
  estado: EstadoOral; devolucion: string;
  cambioApoyo?: { anterior: ApoyoOral | null; elegido: ApoyoOral | null };
  revisarRubrica: boolean;
};

const PLAZO_PROCESO_MS = 120_000;

export class ErrorAulaOral extends Error {}

const contexto = (destino: Destino) => and(
  eq(aulaOrales.cursoMoodleId, destino.cursoId), eq(aulaOrales.tareaMoodleId, destino.tareaId)
);
const alumnoEn = (destino: Destino, alumnoId: number) => and(
  contexto(destino), eq(aulaOrales.alumnoMoodleId, alumnoId)
);
const publicacionDe = (oralId: number, revision: number) => and(
  eq(aulaPublicaciones.oralId, oralId), eq(aulaPublicaciones.revision, revision)
);

export async function listarOrales(destino: Destino) {
  const filas = await db.select({ oral: aulaOrales, publicacion: aulaPublicaciones })
    .from(aulaOrales).leftJoin(aulaPublicaciones, and(
      eq(aulaPublicaciones.oralId, aulaOrales.id), eq(aulaPublicaciones.revision, aulaOrales.revision)
    ))
    .where(contexto(destino));
  return filas.map(({ oral, publicacion }) => ({
    alumnoId: oral.alumnoMoodleId,
    revision: oral.revision,
    versionRubrica: oral.versionRubrica,
    apoyo: oral.apoyo,
    estado: oral.estado,
    caudales: oral.caudales,
    unidades: oral.unidades,
    justificacion: oral.justificacion,
    devolucion: oral.devolucion,
    nota: oral.estado === 'evaluado' ? notaOral(oral) : null,
    publicacion: publicacion?.estado ?? null,
    detalle: publicacion?.ultimoError ?? null
  }));
}

export async function guardarOral(destino: Destino, autorId: number, registro: Registro): Promise<void> {
  const { alumnoId, revision, cambioApoyo, revisarRubrica, ...valores } = registro;
  const condicion = alumnoEn(destino, alumnoId);
  const registroCambiado = await db.transaction(async (tx) => {
    const [actual] = await tx.select().from(aulaOrales).where(condicion).for('update');
    if (!actual) {
      if (revision !== 0) throw new ErrorAulaOral('La evaluación cambió. Volvé a abrir el registro.');
      const [insercion] = await tx.insert(aulaOrales).values({
        ...valores, autorId, versionRubrica: VERSION_RUBRICA_ORAL, apoyo: cambioApoyo?.elegido ?? null,
        cursoMoodleId: destino.cursoId, tareaMoodleId: destino.tareaId, alumnoMoodleId: alumnoId
      });
      return insercion.insertId;
    }
    const editaApoyo = cambioApoyo && cambioApoyo.elegido !== cambioApoyo.anterior;
    if (editaApoyo && cambioApoyo.anterior !== actual.apoyo && cambioApoyo.elegido !== actual.apoyo) {
      throw new ErrorAulaOral('Otra persona cambió el apoyo. Recargá para revisar.');
    }
    const apoyo = editaApoyo ? cambioApoyo.elegido : actual.apoyo;
    const cambioCriterios = actual.caudales !== valores.caudales || actual.unidades !== valores.unidades ||
      actual.justificacion !== valores.justificacion;
    const cambioEvaluacion = cambioCriterios || actual.estado !== valores.estado || actual.devolucion !== valores.devolucion;
    const habiaCriterios = actual.caudales !== null || actual.unidades !== null || actual.justificacion !== null;
    if (actual.versionRubrica < VERSION_RUBRICA_ORAL && valores.estado === 'evaluado' && cambioCriterios && habiaCriterios && !revisarRubrica) {
      throw new ErrorAulaOral('Confirmá que volviste a observar los criterios con la rúbrica actual.');
    }
    const versionRubrica = valores.estado === 'evaluado' && (revisarRubrica || (cambioCriterios && !habiaCriterios))
      ? VERSION_RUBRICA_ORAL : actual.versionRubrica;
    if (!cambioEvaluacion && apoyo === actual.apoyo && versionRubrica === actual.versionRubrica) return;
    if (revision !== actual.revision) throw new ErrorAulaOral('Otra persona actualizó la evaluación. Recargá para revisar.');
    // El apoyo y la versión de los descriptores son locales. La revisión de publicación
    // sólo cambia cuando se modifica la evaluación que el docente puede enviar.
    if (!cambioEvaluacion) {
      await tx.update(aulaOrales).set({ apoyo, versionRubrica }).where(eq(aulaOrales.id, actual.id));
      return actual.id;
    }
    const [publicacion] = await tx.select().from(aulaPublicaciones).where(publicacionDe(actual.id, revision));
    if (publicacion && (publicacion.estado === 'pendiente' || publicacion.estado === 'enviando' || publicacion.estado === 'error')) {
      throw new ErrorAulaOral('Primero resolvé la publicación pendiente antes de corregir este registro.');
    }
    if ((valores.estado !== 'evaluado' || notaOral(valores) === null) && (await tx.select({ id: aulaPublicaciones.id })
      .from(aulaPublicaciones).where(and(eq(aulaPublicaciones.oralId, actual.id), eq(aulaPublicaciones.estado, 'verificado'))).limit(1)).length) {
      throw new ErrorAulaOral('Ya hay nota en Moodle. Una corrección necesita los tres criterios completos.');
    }
    await tx.update(aulaOrales).set({ ...valores, apoyo, versionRubrica, autorId, revision: revision + 1 }).where(eq(aulaOrales.id, actual.id));
    return actual.id;
  });
  if (registroCambiado) await registrarAccion({ usuarioId: autorId, accion: 'aula_oral_guardar', tablaDestino: 'aula_orales', idDestino: registroCambiado });
}

async function encolar(destino: Destino, autorId: number, seleccion: Revision[]) {
  return db.transaction(async (tx) => {
    const trabajos: { oral: Oral; id: number }[] = [];
    for (const item of [...seleccion].sort((a, b) => a.alumnoId - b.alumnoId)) {
      const [oral] = await tx.select().from(aulaOrales).where(alumnoEn(destino, item.alumnoId)).for('update');
      if (!oral || oral.revision !== item.revision || oral.estado !== 'evaluado') {
        throw new ErrorAulaOral('Una evaluación cambió. Revisá el lote antes de publicarlo.');
      }
      const nota = notaOral(oral);
      if (nota === null) throw new ErrorAulaOral('Completá los tres criterios antes de publicar.');
      const [existente] = await tx.select().from(aulaPublicaciones).where(publicacionDe(oral.id, oral.revision));
      if (existente) {
        trabajos.push({ oral, id: existente.id });
        continue;
      }
      const [insercion] = await tx.insert(aulaPublicaciones).values({
        oralId: oral.id, revision: oral.revision, autorId, nota: nota.toFixed(2), devolucion: oral.devolucion
      });
      trabajos.push({ oral, id: insercion.insertId });
    }
    return trabajos;
  });
}

function mismoFeedback(moodle: string | null, local: string) {
  return (moodle ?? '').replace(/\r\n?/g, '\n').trim() === local.replace(/\r\n?/g, '\n').trim();
}

function coincide(nota: NotaMoodle, publicacion: Publicacion) {
  return nota.nota === Number(publicacion.nota) && mismoFeedback(nota.feedback, publicacion.devolucion);
}

async function procesar(moodle: MoodleAula, oral: Oral, id: number) {
  const idProceso = randomUUID();
  const operador = and(eq(aulaPublicaciones.id, id), eq(aulaPublicaciones.idProceso, idProceso));
  const listo = or(eq(aulaPublicaciones.estado, 'pendiente'), eq(aulaPublicaciones.estado, 'error'), eq(aulaPublicaciones.estado, 'conflicto'), and(
    eq(aulaPublicaciones.estado, 'enviando'),
    or(isNull(aulaPublicaciones.procesandoDesde), lte(aulaPublicaciones.procesandoDesde, new Date(Date.now() - PLAZO_PROCESO_MS)))
  ));
  const trabajo = await db.transaction(async (tx) => {
    const [vigente] = await tx.select({ revision: aulaOrales.revision }).from(aulaOrales)
      .where(eq(aulaOrales.id, oral.id)).for('update');
    if (vigente?.revision !== oral.revision) return;
    const [reclamo] = await tx.update(aulaPublicaciones).set({
      estado: 'enviando', idProceso, procesandoDesde: new Date(), intentos: sql`${aulaPublicaciones.intentos} + 1`
    }).where(and(eq(aulaPublicaciones.id, id), listo));
    if (!reclamo.affectedRows) return;
    const [publicacion] = await tx.select().from(aulaPublicaciones).where(operador);
    return publicacion;
  });
  if (!trabajo) return;

  const terminar = (estado: Publicacion['estado'], ultimoError: string | null, intento?: number) => db.update(aulaPublicaciones).set({
    estado, ultimoError, idProceso: null, procesandoDesde: null, verificadoAt: estado === 'verificado' ? new Date() : null,
    ...(intento === undefined ? {} : { intentoMoodle: intento })
  }).where(operador);

  try {
    const leer = () => moodle.leerNota(oral.tareaMoodleId, oral.alumnoMoodleId);
    let remoto = await leer();
    if (remoto.bloqueada || remoto.sobrescrita) {
      await terminar('conflicto', 'La calificación está bloqueada o sobrescrita en Moodle.');
      return;
    }
    if (trabajo.intentoMoodle !== null && remoto.intento !== trabajo.intentoMoodle) {
      await terminar('conflicto', 'El intento activo cambió en Moodle.');
      return;
    }

    if (!coincide(remoto, trabajo)) {
      if (remoto.nota !== null || remoto.notaLibro !== null || (remoto.feedback ?? '').trim() !== '') {
        const [anterior] = await db.select().from(aulaPublicaciones).where(and(
          eq(aulaPublicaciones.oralId, oral.id), eq(aulaPublicaciones.estado, 'verificado'),
          lte(aulaPublicaciones.revision, trabajo.revision - 1)
        )).orderBy(desc(aulaPublicaciones.revision)).limit(1);
        if (!anterior || !coincide(remoto, anterior) || remoto.notaLibro !== Number(anterior.nota) ||
            (anterior.intentoMoodle !== null && anterior.intentoMoodle !== remoto.intento)) {
          await terminar('conflicto', 'La nota o devolución ya cambió en Moodle. Revisala antes de volver a publicar.');
          return;
        }
      }
      const [reserva] = await db.update(aulaPublicaciones).set({ intentoMoodle: remoto.intento }).where(operador);
      if (!reserva.affectedRows) return;
      await moodle.publicarNota({
        cursoId: oral.cursoMoodleId, tareaId: oral.tareaMoodleId, alumnoId: oral.alumnoMoodleId,
        intento: remoto.intento, nota: Number(trabajo.nota), feedback: trabajo.devolucion
      });
      remoto = await leer();
    }
    if (!coincide(remoto, trabajo) || remoto.notaLibro !== Number(trabajo.nota) || remoto.bloqueada || remoto.sobrescrita) {
      await terminar('error', 'Moodle aún no confirmó la misma nota y devolución. Volvé a verificar el envío.');
      return;
    }
    await terminar('verificado', null, remoto.intento);
  } catch {
    await terminar('error', 'No se pudo verificar el envío con Moodle. Al reintentar se revisará primero lo que quedó guardado.');
  }
}

export async function publicarOrales(destino: Destino, autorId: number, seleccion: Revision[], moodle: MoodleAula) {
  const trabajos = await encolar(destino, autorId, seleccion);
  for (const { oral, id } of trabajos) await procesar(moodle, oral, id);
  const ids = new Set(seleccion.map((item) => item.alumnoId));
  const publicados = (await listarOrales(destino)).filter((fila) => ids.has(fila.alumnoId));
  return {
    verificados: publicados.filter((fila) => fila.publicacion === 'verificado').length,
    restantes: publicados.filter((fila) => fila.publicacion !== 'verificado').length
  };
}
