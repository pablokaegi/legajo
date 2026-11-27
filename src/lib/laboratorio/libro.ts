import { z } from 'zod';
import { demoInicial } from './apoyos';

function texto(maximo: number, minimo = 1) {
  // Los formularios envían CRLF y los capítulos de Moodle se guardan con LF.
  return z.string().transform((v) => v.replace(/\r\n?/g, '\n').trim())
    .pipe(z.string().min(minimo).max(maximo).refine((v) => !v.includes('\0')));
}

const paso = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/),
  titulo: texto(120),
  consigna: texto(1400),
  audio: texto(1400, 0)
});

// Éste es el único contenido que el docente prepara para compartir con el curso.
export const esquemaLibro = z.object({
  titulo: texto(120),
  objetivo: texto(500),
  pasos: z.array(paso).min(1).max(8)
}).refine(({ pasos }) => new Set(pasos.map((p) => p.id)).size === pasos.length);

export type ActividadLibro = z.infer<typeof esquemaLibro>;

export function actividadCiencias(): ActividadLibro {
  return esquemaLibro.parse(demoInicial().actividad);
}
