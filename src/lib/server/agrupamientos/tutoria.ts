// Tutoría entre pares (misma edad, distinto nivel).
// Emparejamiento tipo PALS (Fuchs et al., 1997): se ordena el curso por nota,
// se parte la lista al medio y se junta al 1.º de la mitad fuerte con el 1.º
// de la mitad débil, el 2.º con el 2.º, etc. Así la brecha es moderada: el
// tutor sabe más, pero no tanto como para que la explicación no "llegue".
// Beneficia a ambos (Topping, 2005; Leung, 2015). Se evitan los pedidos de no
// estar juntos y, si se puede, se prefiere un par con algún vínculo.

import type { AlumnoRef } from './tipos.js';
import type { Grafo } from './grafo.js';

export interface MiembroTutoria extends AlumnoRef {
  nota: number | null;
  rol: 'tutor' | 'tutorado' | 'par';
}

export function generarTutorias(
  conNota: (AlumnoRef & { nota: number | null })[],
  g: Grafo
): MiembroTutoria[][] {
  const conN = conNota
    .filter((a) => a.nota != null)
    .sort((a, b) => b.nota! - a.nota! || a.id - b.id);
  const sinN = conNota.filter((a) => a.nota == null);

  const h = Math.floor(conN.length / 2);
  const fuertes = conN.slice(0, h);
  const debiles = conN.slice(h); // h o h+1

  const vinculo = (a: number, b: number) => g.elige(a, b) || g.elige(b, a);
  const choca = (i: number) => i < fuertes.length && g.bloqueado(fuertes[i].id, debiles[i].id);

  // Corrige choques con intercambios cercanos (mantiene la brecha moderada).
  for (let i = 0; i < fuertes.length; i++) {
    if (!choca(i)) continue;
    for (const d of [1, -1, 2, -2]) {
      const j = i + d;
      if (j < 0 || j >= fuertes.length) continue;
      [debiles[i], debiles[j]] = [debiles[j], debiles[i]];
      if (!choca(i) && !choca(j)) break;
      [debiles[i], debiles[j]] = [debiles[j], debiles[i]];
    }
  }
  // Si un par vecino gana un vínculo sin perder otro ni chocar, intercambiar.
  for (let i = 0; i + 1 < fuertes.length; i++) {
    const antes = Number(vinculo(fuertes[i].id, debiles[i].id)) + Number(vinculo(fuertes[i + 1].id, debiles[i + 1].id));
    const despues = Number(vinculo(fuertes[i].id, debiles[i + 1].id)) + Number(vinculo(fuertes[i + 1].id, debiles[i].id));
    if (despues > antes &&
        !g.bloqueado(fuertes[i].id, debiles[i + 1].id) && !g.bloqueado(fuertes[i + 1].id, debiles[i].id)) {
      [debiles[i], debiles[i + 1]] = [debiles[i + 1], debiles[i]];
    }
  }

  const pares: MiembroTutoria[][] = fuertes.map((f, i) => [
    { ...f, rol: 'tutor' },
    { ...debiles[i], rol: 'tutorado' }
  ]);
  // Curso impar: el que sobra se suma al último par como segundo tutorado.
  if (debiles.length > fuertes.length) {
    const extra = { ...debiles[debiles.length - 1], rol: 'tutorado' as const };
    if (pares.length > 0) pares[pares.length - 1].push(extra);
    else pares.push([extra]);
  }
  // Sin nota: pares entre ellos (el docente decide quién tutorea).
  for (let i = 0; i < sinN.length; i += 2) {
    pares.push(sinN.slice(i, i + 2).map((a) => ({ ...a, rol: 'par' as const })));
  }
  return repararChoques(pares, g);
}

/**
 * Si quedó algún par con pedido de no estar juntos, intercambia a un tutorado
 * (o "par") con el del par más cercano en la lista, para no agrandar la brecha.
 */
function repararChoques(pares: MiembroTutoria[][], g: Grafo): MiembroTutoria[][] {
  const choques = (p: MiembroTutoria[]) => {
    let c = 0;
    for (let i = 0; i < p.length; i++)
      for (let j = i + 1; j < p.length; j++) if (g.bloqueado(p[i].id, p[j].id)) c++;
    return c;
  };
  for (let i = 0; i < pares.length; i++) {
    for (let a = 0; a < pares[i].length && choques(pares[i]) > 0; a++) {
      const x = pares[i][a];
      if (x.rol === 'tutor') continue;
      let hecho = false;
      for (let d = 1; d < pares.length && !hecho; d++) {
        for (const j of [i + d, i - d]) {
          if (j < 0 || j >= pares.length || hecho) continue;
          for (let b = 0; b < pares[j].length; b++) {
            const y = pares[j][b];
            if (y.rol === 'tutor') continue; // los tutores no se mueven
            const antes = choques(pares[i]) + choques(pares[j]);
            // Cada uno toma el papel del lugar al que va (un "par" puede pasar a tutorado).
            pares[i][a] = { ...y, rol: x.rol };
            pares[j][b] = { ...x, rol: y.rol };
            if (choques(pares[i]) + choques(pares[j]) < antes) { hecho = true; break; }
            pares[i][a] = x;
            pares[j][b] = y;
          }
        }
      }
    }
  }
  return pares;
}
