import { z } from 'zod';
import { esquemaLibro, type ActividadLibro } from '$lib/laboratorio/libro';
import { ErrorServicioMoodleDePrueba, servicioMoodleDePrueba } from './aula-rest.js';
import { sintetizarAudios } from './audio-libro.js';

const entero = z.number().int().nonnegative().safe();
const positivo = entero.min(1);
const libroRecibido = z.object({
  cmid: entero, bookid: entero, revision: entero, titulo: z.string(), objetivo: z.string(),
  pasos: z.array(z.object({ id: z.string(), titulo: z.string(), consigna: z.string(), audio: z.string(), chapterid: positivo }))
});
const recibo = z.object({
  cmid: positivo, bookid: positivo, revision: positivo,
  chapters: z.array(z.object({ id: z.string(), chapterid: positivo })), changed: z.boolean()
});

export class ErrorLibro extends Error {
  constructor(public readonly status: 400 | 409 | 503, mensaje: string) { super(mensaje); }
}

async function generarAudios(guiones: string[]): Promise<string[]> {
  try {
    return await sintetizarAudios(guiones);
  } catch (err) {
    if (err instanceof RangeError) throw new ErrorLibro(400, err.message);
    throw new ErrorLibro(503, 'No se pudo generar la narración. Revisá la voz en español del equipo y volvé a publicar.');
  }
}

export function libroCiencias(entorno: Record<string, string | undefined>) {
  const { cursoId, llamar } = servicioMoodleDePrueba(entorno, 'MOODLE_AULA_LIBRO_TOKEN');
  const urlLibro = (cmid: number) => new URL('mod/book/view.php?id=' + cmid, entorno.MOODLE_AULA_URL!.replace(/\/?$/, '/')).href;
  async function leer() {
    const datos = await llamar('local_legajolibro_leer', { courseid: cursoId }, libroRecibido).catch((err: unknown) => {
      if (err instanceof ErrorServicioMoodleDePrueba && err.codigo === 'drift') {
        throw new ErrorLibro(409, 'El Libro fue modificado directamente en Moodle. Revisá con administración esos cambios antes de publicar desde Legajo.');
      }
      throw err;
    });
    if (datos.revision === 0 && !datos.bookid && !datos.cmid && !datos.pasos.length) {
      return { revision: 0, actividad: null, url: null, capitulos: [] };
    }
    if (!datos.revision || !datos.bookid || !datos.cmid) throw new Error('Libro inconsistente');
    const url = urlLibro(datos.cmid);
    const capitulos = datos.pasos.map((paso) => ({
      id: paso.id, titulo: paso.titulo, url: url + '&chapterid=' + paso.chapterid, audio: Boolean(paso.audio)
    }));
    return { revision: datos.revision, actividad: esquemaLibro.parse(datos), url, capitulos };
  }
  async function publicar(actividad: ActividadLibro, revision: number) {
    const anterior = await leer();
    const coincide = JSON.stringify(anterior.actividad) === JSON.stringify(actividad);
    if (anterior.revision !== revision && !coincide) {
      throw new ErrorLibro(409, 'Otra persona actualizó el Libro. Compará con la versión publicada y recargá el editor antes de guardar.');
    }
    const nuevos = actividad.pasos.filter((paso) => paso.audio && !anterior.actividad?.pasos.some(
      (actual) => actual.id === paso.id && actual.audio === paso.audio
    ));
    const audios = await generarAudios(nuevos.map((p) => p.audio));
    const archivos = new Map(nuevos.map(({ id }, i) => [id, audios[i]]));
    const parametros: Record<string, string | number> = {
      courseid: cursoId, revision: anterior.revision + 1, titulo: actividad.titulo, objetivo: actividad.objetivo
    };
    actividad.pasos.forEach((paso, i) => {
      for (const [clave, valor] of Object.entries(paso)) parametros[`pasos[${i}][${clave}]`] = valor;
      parametros[`pasos[${i}][archivo]`] = archivos.get(paso.id) ?? '';
    });
    const cuerpo = new URLSearchParams();
    for (const [campo, valor] of Object.entries(parametros)) cuerpo.set(campo, String(valor));
    if (cuerpo.toString().length + 1024 > 64 * 1024 * 1024) {
      throw new ErrorLibro(400, 'Los audios nuevos juntos superan los 64 MB por envío de este Moodle. Publicá primero el texto y agregá los guiones en tandas.');
    }
    try {
      const resultado = await llamar('local_legajolibro_publicar', parametros, recibo);
      if (resultado.chapters.length !== actividad.pasos.length ||
          !resultado.chapters.every((c, indice) => c.id === actividad.pasos[indice].id)) throw new Error('Capítulos sin confirmar');
      return { revision: resultado.revision, url: urlLibro(resultado.cmid), cmid: resultado.cmid, cambio: resultado.changed };
    } catch (err) {
      if (err instanceof ErrorServicioMoodleDePrueba && err.codigo === 'drift') {
        throw new ErrorLibro(409, 'El Libro cambió directamente en Moodle. Revisá los capítulos con administración antes de volver a publicar.');
      }
      // Una respuesta perdida puede corresponder a una escritura ya confirmada en Moodle.
      const actual = await leer();
      if (actual.actividad && actual.url && JSON.stringify(actual.actividad) === JSON.stringify(actividad)) {
        return { revision: actual.revision, url: actual.url, cmid: Number(new URL(actual.url).searchParams.get('id')), cambio: false };
      }
      if (actual.revision !== anterior.revision) throw new ErrorLibro(409, 'El Libro cambió mientras publicabas. Recargá para revisar la versión actual.');
      throw new ErrorLibro(503, 'Moodle no confirmó la publicación. Revisá el acceso del servicio y volvé a intentar.');
    }
  }
  return { leer, publicar };
}
