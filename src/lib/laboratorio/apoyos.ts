import { z } from 'zod';

const pasoSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().max(120),
  consigna: z.string().max(1400),
  audio: z.string().max(1400)
});

const actividadSchema = z.object({
  titulo: z.string().max(120),
  objetivo: z.string().max(500),
  moodleUrl: z.string().max(2048),
  pasos: z.array(pasoSchema).min(1).max(8)
}).refine((actividad) => new Set(actividad.pasos.map((paso) => paso.id)).size === actividad.pasos.length);

export const apoyoSchema = z.object({
  barrera: z.string().max(500),
  ajuste: z.string().max(500),
  responsable: z.string().max(120),
  revision: z.string(),
  ofrecido: z.enum(['pendiente', 'si', 'no']),
  observacion: z.string().max(500),
  decision: z.enum(['pendiente', 'mantener', 'ajustar', 'cerrar'])
});

export const demoSchema = z.object({
  version: z.literal(1),
  actividad: actividadSchema,
  apoyo: apoyoSchema,
  completados: z.array(z.string()).max(8),
  pasoActivo: z.string().nullable()
});

export type Actividad = z.infer<typeof actividadSchema>;

export const DEMO_KEY = 'legajo-laboratorio-apoyos-v1';

export function demoInicial(): z.infer<typeof demoSchema> {
  return {
    version: 1,
    actividad: {
      titulo: '¿Qué canilla consume más agua?',
      objetivo: 'Comparar el consumo por minuto y justificar una decisión con los datos.',
      moodleUrl: '',
      pasos: [
        {
          id: 'leer',
          titulo: 'Leé los datos',
          consigna: 'Canilla A: se juntaron 12 litros en 3 minutos.\nCanilla B: se juntaron 18 litros en 3 minutos.\nAnotá el volumen y el tiempo de cada canilla.',
          audio: 'Los datos son ficticios. En la canilla A se juntaron doce litros en tres minutos. En la canilla B se juntaron dieciocho litros en tres minutos. Anotá el volumen y el tiempo de cada canilla.'
        },
        {
          id: 'comparar',
          titulo: 'Calculá y compará',
          consigna: 'Dividí los litros de cada canilla por sus minutos.\nEjemplo de inicio: para la canilla A, escribí 12 ÷ 3.\nCompará los dos resultados en litros por minuto.',
          audio: 'Dividí los litros de cada canilla por sus minutos. Para la canilla A, empezá con doce dividido tres. Luego compará ambos resultados en litros por minuto.'
        },
        {
          id: 'justificar',
          titulo: 'Justificá tu decisión',
          consigna: '¿Qué canilla revisarías primero? Usá los dos resultados para explicar por qué.\nMencioná una condición que debería ser comparable al medir, como la apertura de la canilla.\nPrepará una respuesta breve en texto o audio.',
          audio: 'Decidí qué canilla revisarías primero y explicá por qué con ambos resultados. Nombrá una condición de medición que convenga mantener comparable.'
        }
      ]
    },
    apoyo: {
      barrera: 'En el ejemplo ficticio, una consigna larga dificulta identificar cómo empezar.',
      ajuste: 'Mostrar una consigna por paso, ofrecer audio opcional y dejar visible un ejemplo de inicio.',
      responsable: 'Docente de Ciencias · cuenta ficticia',
      revision: '',
      ofrecido: 'pendiente',
      observacion: '',
      decision: 'pendiente'
    },
    completados: [],
    pasoActivo: 'leer'
  };
}

export function enlaceMoodle(valor: string): string | null {
  try {
    const url = new URL(valor.trim());
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

function escapar(texto: string): string {
  return texto.replace(/[&<>"']/g, (caracter) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[caracter]!);
}

export function htmlParaMoodle(actividad: Actividad): string {
  const pasos = actividad.pasos.map((paso) => {
    const parrafos = paso.consigna.split('\n').filter((linea) => linea.trim())
      .map((linea) => `<p>${escapar(linea)}</p>`).join('\n');
    return `<li><h3>${escapar(paso.titulo)}</h3>\n${parrafos}</li>`;
  }).join('\n');
  return `<h2>${escapar(actividad.titulo)}</h2>
<p><strong>Objetivo:</strong> ${escapar(actividad.objetivo)}</p>
<ol>
${pasos}
</ol>`;
}
