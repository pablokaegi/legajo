// Agrupamiento por afinidad.
// Objetivo: grupos de tamaño parejo (nadie queda solo) donde cada alumno tenga
// al menos un compañero que eligió o que lo eligió, priorizando las elecciones
// recíprocas y sin juntar a quienes pidieron no quedar juntos.
// Tener al menos un vínculo recíproco en el grupo es protector para los
// alumnos menos elegidos (Parker & Asher, 1993; Bukowski & Hoza, 1989).
//
// Método: reparto voraz por mejor ganancia + mejora local por intercambios
// (determinístico: la misma votación da siempre los mismos grupos).

import type { AlumnoRef } from './tipos.js';
import { capacidades, type Grafo } from './grafo.js';

export interface GrupoEmparejado {
  miembros: AlumnoRef[];
  /** Pares con elección recíproca dentro del grupo. */
  mutuas: number;
  /** Elecciones (dirigidas) que quedaron dentro del grupo. */
  vinculos: number;
  /** Miembros sin ningún vínculo con el resto del grupo. */
  sinVinculo: AlumnoRef[];
}

const BLOQUEO = 100;   // penalización por juntar a quienes pidieron no estar juntos
const APOYO = 2;       // premio por cada alumno con al menos un vínculo en su grupo

export function generarEmparejamientos(
  g: Grafo,
  opciones: { tamano?: number } = {}
): GrupoEmparejado[] {
  const tamano = Math.max(2, Math.min(6, opciones.tamano ?? 4));
  const ids = g.alumnos.map((a) => a.id);
  if (ids.length === 0) return [];

  const caps = capacidades(ids.length, tamano);
  const G = caps.length;

  // Fuerza del vínculo entre dos alumnos (simétrica). Las recíprocas valen más.
  const lazo = (a: number, b: number) =>
    g.peso(a, b) + g.peso(b, a) + (g.elige(a, b) && g.elige(b, a) ? 1 : 0);
  const tieneVinculo = (m: number, grupo: number[]) =>
    grupo.some((x) => x !== m && (g.elige(m, x) || g.elige(x, m)));

  const valor = (grupo: number[]) => {
    let v = 0;
    for (let i = 0; i < grupo.length; i++) {
      for (let j = i + 1; j < grupo.length; j++) {
        v += lazo(grupo[i], grupo[j]);
        if (g.bloqueado(grupo[i], grupo[j])) v -= BLOQUEO;
      }
      if (tieneVinculo(grupo[i], grupo)) v += APOYO;
    }
    return v;
  };

  const grupos: number[][] = Array.from({ length: G }, () => []);
  const asignado = new Set<number>();
  const hayLugar = (gi: number) => grupos[gi].length < caps[gi];

  // 1. Semillas: las parejas más fuertes (recíprocas primero) inician grupos distintos.
  const enCurso = new Set(ids);
  const parejas: [number, number][] = [];
  for (const a of ids)
    for (const b of g.eleccionesDe(a))
      if (enCurso.has(b) && (a < b || !g.elige(b, a))) parejas.push([a, b]);
  const candidatas = parejas
    .filter(([a, b]) => !g.bloqueado(a, b))
    .sort((x, y) => lazo(y[0], y[1]) - lazo(x[0], x[1]) || x[0] - y[0] || x[1] - y[1]);
  let sembrados = 0;
  for (const [a, b] of candidatas) {
    if (sembrados >= G) break;
    if (asignado.has(a) || asignado.has(b) || caps[sembrados] < 2) continue;
    grupos[sembrados].push(a, b);
    asignado.add(a);
    asignado.add(b);
    sembrados++;
  }

  // 2. Voraz: en cada paso, la ubicación (alumno, grupo) que más suma.
  for (;;) {
    let mejor: { id: number; gi: number; ganancia: number } | null = null;
    for (const id of ids) {
      if (asignado.has(id)) continue;
      for (let gi = 0; gi < G; gi++) {
        if (!hayLugar(gi) || grupos[gi].length === 0) continue;
        if (grupos[gi].some((m) => g.bloqueado(m, id))) continue;
        let ganancia = 0;
        for (const m of grupos[gi]) ganancia += lazo(id, m);
        if (ganancia <= 0) continue;
        if (
          !mejor ||
          ganancia > mejor.ganancia ||
          (ganancia === mejor.ganancia && grupos[gi].length < grupos[mejor.gi].length)
        ) mejor = { id, gi, ganancia };
      }
    }
    if (!mejor) break;
    grupos[mejor.gi].push(mejor.id);
    asignado.add(mejor.id);
  }

  // 3. Resto (sin vínculos con nadie ubicado): primero grupos vacíos, después el
  //    más chico sin conflictos. La mejora local los acomoda.
  for (const id of ids) {
    if (asignado.has(id)) continue;
    let destino = -1;
    for (let gi = 0; gi < G; gi++) {
      if (!hayLugar(gi)) continue;
      const choca = grupos[gi].some((m) => g.bloqueado(m, id));
      if (destino < 0) { destino = gi; continue; }
      const chocaDest = grupos[destino].some((m) => g.bloqueado(m, id));
      if ((chocaDest && !choca) || (choca === chocaDest && grupos[gi].length < grupos[destino].length))
        destino = gi;
    }
    grupos[destino < 0 ? 0 : destino].push(id);
    asignado.add(id);
  }

  // 4. Mejora local: intercambios entre grupos mientras sumen.
  for (let ronda = 0; ronda < 30; ronda++) {
    let mejoro = false;
    for (let gi = 0; gi < G; gi++) {
      for (let gj = gi + 1; gj < G; gj++) {
        for (let a = 0; a < grupos[gi].length; a++) {
          for (let b = 0; b < grupos[gj].length; b++) {
            const x = grupos[gi][a];
            const y = grupos[gj][b];
            const antes = valor(grupos[gi]) + valor(grupos[gj]);
            grupos[gi][a] = y;
            grupos[gj][b] = x;
            const despues = valor(grupos[gi]) + valor(grupos[gj]);
            if (despues > antes + 1e-9) mejoro = true;
            else { grupos[gi][a] = x; grupos[gj][b] = y; }
          }
        }
      }
    }
    if (!mejoro) break;
  }

  return grupos
    .filter((gr) => gr.length > 0)
    .map((gr) => {
      let mutuas = 0;
      let vinculos = 0;
      for (const a of gr) {
        for (const b of gr) {
          if (a === b) continue;
          if (g.elige(a, b)) vinculos++;
          if (a < b && g.elige(a, b) && g.elige(b, a)) mutuas++;
        }
      }
      const ref = (id: number) => ({ id, nombre: g.nombre(id) });
      return {
        miembros: gr.map(ref),
        mutuas,
        vinculos,
        sinVinculo: gr.filter((m) => !tieneVinculo(m, gr)).map(ref)
      };
    })
    .sort((x, y) => y.mutuas - x.mutuas || y.vinculos - x.vinculos);
}
