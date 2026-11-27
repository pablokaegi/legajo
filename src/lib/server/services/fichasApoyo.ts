import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { apoyoSchema } from '$lib/laboratorio/apoyos.js';
import { db } from '$lib/server/db/index.js';
import { fichasApoyo } from '$lib/server/db/schema.js';
import { registrarAccion } from './audit.js';

export const datosFichaApoyo = apoyoSchema.extend({
  barrera: z.string().trim().min(1, 'Describí la barrera observada.').max(500),
  ajuste: z.string().trim().min(1, 'Indicá el apoyo acordado.').max(500),
  responsable: z.string().trim().min(1, 'Indicá quién acompaña al estudiante.').max(120),
  revision: z.string().date('Elegí una fecha de revisión válida.').min(10)
    .refine((d) => d >= '1000-01-01', 'Elegí una fecha de revisión válida.'),
  observacion: z.string().trim().max(500)
});

type Contenido = z.infer<typeof datosFichaApoyo>;
const campos = datosFichaApoyo.keyof().options;
const destino = (cursoId: number, alumnoId: number) => and(
  eq(fichasApoyo.cursoMoodleId, cursoId), eq(fichasApoyo.alumnoMoodleId, alumnoId)
);

export class ConflictoFichaApoyo extends Error {}

export async function leerFichaApoyo(cursoId: number, alumnoId: number) {
  const [fila] = await db.select().from(fichasApoyo).where(destino(cursoId, alumnoId));
  if (!fila) return null;
  const { barrera, ajuste, responsable, revision, ofrecido, observacion, decision, version } = fila;
  return { barrera, ajuste, responsable, revision, ofrecido, observacion, decision, version };
}

export async function guardarFichaApoyo(cursoId: number, alumnoId: number, autorId: number, version: number, contenido: Contenido) {
  if (version === 0) {
    try {
      const [alta] = await db.insert(fichasApoyo).values({
        ...contenido, cursoMoodleId: cursoId, alumnoMoodleId: alumnoId, autorId
      });
      await registrarAccion({ usuarioId: autorId, accion: 'ficha_apoyo_crear', tablaDestino: 'fichas_apoyo', idDestino: alta.insertId });
      return 1;
    } catch (err) {
      const causa = err as { code?: string; cause?: { code?: string } };
      if (causa.code !== 'ER_DUP_ENTRY' && causa.cause?.code !== 'ER_DUP_ENTRY') throw err;
      // Una creación simultánea o un reenvío continúan contra la fila existente.
    }
  }
  const condicion = destino(cursoId, alumnoId);
  const resultado = await db.transaction(async (tx) => {
    const [actual] = await tx.select().from(fichasApoyo).where(condicion).for('update');
    if (actual && campos.every((campo) => actual[campo] === contenido[campo])) {
      return { version: actual.version, cambio: null };
    }
    if (!actual || actual.version !== version) throw new ConflictoFichaApoyo();
    const nuevaVersion = version + 1;
    await tx.update(fichasApoyo).set({ ...contenido, version: nuevaVersion, autorId }).where(condicion);
    return { version: nuevaVersion, cambio: actual.id };
  });
  if (resultado.cambio) {
    await registrarAccion({ usuarioId: autorId, accion: 'ficha_apoyo_editar', tablaDestino: 'fichas_apoyo', idDestino: resultado.cambio });
  }
  return resultado.version;
}
