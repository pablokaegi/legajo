// Ubicación inclusiva en el aula (bancos de a dos).
// Sentar a un alumno poco aceptado junto a un compañero bien aceptado, que no
// lo rechaza y —si es posible— al que él eligió, mejora cómo lo ven sus pares
// (van den Berg & Stoltz, 2018; van den Berg, Segers & Cillessen, 2012).
// La cercanía física genera vínculos: el docente "maneja" la red del aula
// también con el plano de asientos (Gest & Rodkin, 2011).

import type { AlumnoRef } from './tipos.js';
import { repararBloqueos, type Grafo } from './grafo.js';
import type { AnalisisSocial } from './analizar.js';
import { tasaEleccion } from './gruposTrabajo.js';
import { mediana } from './stats.js';

export interface Banco {
  asientos: AlumnoRef[];
  /** Por qué se armó así (solo para el docente). */
  motivo?: string;
}

const NUNCA = -1000;

export function generarUbicacion(g: Grafo, analisis: AnalisisSocial | null): Banco[] {
  const alumnos = g.alumnos;
  if (alumnos.length === 0) return [];
  const ref = (id: number): AlumnoRef => ({ id, nombre: g.nombre(id) });

  const vulnerables = (analisis?.paraAcompanar ?? [])
    .filter((p) => alumnos.some((a) => a.id === p.id))
    .map((p) => p.id);
  const esVulnerable = new Set(vulnerables);

  const tasas = alumnos.map((a) => tasaEleccion(g, a.id)).filter((t): t is number => t != null);
  const med = tasas.length ? mediana(tasas) : 0;
  const aceptado = (id: number) =>
    (tasaEleccion(g, id) ?? 0) >= med && g.rechazosRecibidos(id) === 0 && !esVulnerable.has(id);

  // Qué tan bueno es sentar a v (a acompañar) junto a p.
  const puntaje = (v: number, p: number) => {
    if (g.bloqueado(v, p)) return NUNCA;
    let s = 0;
    if (aceptado(p)) s += 3;
    if (g.elige(v, p)) s += 2;
    if (g.elige(p, v)) s += 1;
    if (esVulnerable.has(p)) s -= 2; // no juntar a dos que necesitan apoyo
    return s;
  };
  const lazo = (a: number, b: number) =>
    g.bloqueado(a, b) ? NUNCA : (g.elige(a, b) ? 1 : 0) + (g.elige(b, a) ? 1 : 0);

  const libre = new Set(alumnos.map((a) => a.id));
  const bancosApoyo: Banco[] = [];
  const bancos: Banco[] = [];

  // 1. Cada alumno a acompañar, con su mejor compañero de banco posible.
  for (const v of vulnerables) {
    if (!libre.has(v)) continue;
    let mejor = -1;
    let mejorP = NUNCA;
    for (const p of libre) {
      if (p === v) continue;
      const s = puntaje(v, p);
      if (s > mejorP || (s === mejorP && mejor >= 0 && p < mejor)) { mejorP = s; mejor = p; }
    }
    if (mejor < 0 || mejorP <= NUNCA) continue;
    libre.delete(v);
    libre.delete(mejor);
    const razones: string[] = [];
    if (aceptado(mejor)) razones.push('bien aceptado por el curso');
    if (g.elige(v, mejor)) razones.push(`${g.nombre(v)} lo había elegido`);
    if (g.elige(mejor, v)) razones.push(`eligió a ${g.nombre(v)}`);
    bancosApoyo.push({
      asientos: [ref(v), ref(mejor)],
      motivo: `Acompañamiento: junto a ${g.nombre(mejor)}${razones.length ? ` (${razones.join(', ')})` : ''}.`
    });
  }

  // 2. El resto: primero parejas recíprocas, después el mejor vínculo disponible.
  const restantes = () => [...libre].sort((a, b) => a - b);
  for (const [a, b] of g.paresMutuos) {
    if (libre.has(a) && libre.has(b) && !g.bloqueado(a, b)) {
      libre.delete(a);
      libre.delete(b);
      bancos.push({ asientos: [ref(a), ref(b)] });
    }
  }
  while (libre.size >= 2) {
    const ids = restantes();
    const a = ids[0];
    let mejor = -1;
    let mejorL = NUNCA - 1;
    for (const b of ids.slice(1)) {
      const l = lazo(a, b);
      if (l > mejorL) { mejorL = l; mejor = b; }
    }
    libre.delete(a);
    libre.delete(mejor);
    bancos.push({ asientos: [ref(a), ref(mejor)] });
  }

  // 3. Si sobra uno, se suma al banco donde mejor encaje (banco de a tres).
  if (libre.size === 1) {
    const x = [...libre][0];
    const todos = [...bancosApoyo, ...bancos];
    let destino = todos.find((b) => b.asientos.every((m) => !g.bloqueado(m.id, x))) ?? todos[0];
    let mejor = NUNCA;
    for (const b of todos) {
      const s = b.asientos.reduce((acc, m) => acc + lazo(x, m.id), 0);
      if (s > mejor) { mejor = s; destino = b; }
    }
    if (destino) destino.asientos.push(ref(x));
    else bancos.push({ asientos: [ref(x)] });
  }

  // Si el último par libre quedó con un pedido de no estar juntos, intercambiar
  // con otro banco común (los de acompañamiento no se tocan).
  const comunes = repararBloqueos(bancos.map((b) => b.asientos), g.bloqueado);
  comunes.forEach((asientos, i) => (bancos[i].asientos = asientos));

  // 4. Intercalar los bancos de acompañamiento entre los demás (no concentrarlos
  //    en una fila: que no se note quién "necesita" apoyo).
  if (bancosApoyo.length === 0) return bancos;
  const total = bancosApoyo.length + bancos.length;
  const paso = total / bancosApoyo.length;
  const posApoyo = new Set(bancosApoyo.map((_, k) => Math.floor(k * paso + paso / 2)));
  const resultado: Banco[] = [];
  let ia = 0;
  let ib = 0;
  for (let i = 0; i < total; i++) {
    if ((posApoyo.has(i) && ia < bancosApoyo.length) || ib >= bancos.length) resultado.push(bancosApoyo[ia++]);
    else resultado.push(bancos[ib++]);
  }
  return resultado;
}
