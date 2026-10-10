// Estadísticas agregadas del gabinete para un período (sin datos personales:
// sirven para el tablero y para el informe institucional a dirección).

import { and, gte, inArray, lt, lte, ne } from 'drizzle-orm';
import { db } from '../db/index.js';
import { gabineteCasos, gabineteIntervenciones } from '../db/schema.js';
import { CATEGORIAS, CATEGORIA_POR_ID, parseCategorias } from '../../gabinete/categorias.js';
import { ESTADOS_CASO, TIPOS_INTERVENCION } from '../gabinete/guia.js';

export interface Barra {
  clave: string;
  etiqueta: string;
  valor: number;
  detalle?: string;
}

export interface EstadisticasGabinete {
  desde: string;
  hasta: string;
  casosNuevos: number;
  casosCerrados: number;
  activosHoy: number;
  urgentes: number;
  derivacionesDocentes: number;
  medianaDiasPrimeraIntervencion: number | null;
  totalIntervenciones: number;
  porCategoria: { grupo: string; color: string; barras: Barra[] }[];
  porGrupo: Barra[];
  porCurso: Barra[];
  porNivel: Barra[];
  porEstado: Barra[];
  porOrigen: Barra[];
  intervencionesPorTipo: Barra[];
  intervencionesPorMes: Barra[];
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Período por defecto: ciclo lectivo en curso (desde el 1 de marzo). */
export function periodoPorDefecto(hoy = new Date()) {
  const anio = hoy.getMonth() >= 2 ? hoy.getFullYear() : hoy.getFullYear() - 1;
  return { desde: `${anio}-03-01`, hasta: hoy.toISOString().slice(0, 10) };
}

export function normalizarPeriodo(desde: string | null, hasta: string | null) {
  const def = periodoPorDefecto();
  const d = desde && ISO.test(desde) ? desde : def.desde;
  const h = hasta && ISO.test(hasta) ? hasta : def.hasta;
  return d <= h ? { desde: d, hasta: h } : { desde: h, hasta: d };
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function mesesEntre(desde: string, hasta: string): string[] {
  const out: string[] = [];
  let [y, m] = desde.split('-').map(Number);
  const [yh, mh] = hasta.split('-').map(Number);
  while (y < yh || (y === yh && m <= mh)) {
    out.push(`${y}-${String(m).padStart(2, '0')}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return out;
}

function contar<T>(xs: T[], clave: (x: T) => string | null | undefined): Map<string, number> {
  const m = new Map<string, number>();
  for (const x of xs) {
    const k = clave(x);
    if (k == null) continue;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

function mediana(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round(((s[mid - 1] + s[mid]) / 2) * 10) / 10;
}

export async function estadisticasGabinete(periodo: { desde: string; hasta: string }): Promise<EstadisticasGabinete> {
  const { desde, hasta } = periodo;
  const ini = new Date(`${desde}T00:00:00`);
  const fin = new Date(`${hasta}T00:00:00`);
  fin.setDate(fin.getDate() + 1); // hasta inclusive

  const [casos, cerrados, activos, intervenciones] = await Promise.all([
    db.select().from(gabineteCasos).where(and(gte(gabineteCasos.createdAt, ini), lt(gabineteCasos.createdAt, fin))),
    db.select({ id: gabineteCasos.id }).from(gabineteCasos)
      .where(and(gte(gabineteCasos.cerradoAt, ini), lt(gabineteCasos.cerradoAt, fin))),
    db.select({ id: gabineteCasos.id }).from(gabineteCasos).where(ne(gabineteCasos.estado, 'cerrado')),
    db.select().from(gabineteIntervenciones)
      .where(and(gte(gabineteIntervenciones.fecha, desde), lte(gabineteIntervenciones.fecha, hasta)))
  ]);

  // Categorías (un caso puede tener varias).
  const catsPorCaso = new Map(casos.map((c) => [c.id, parseCategorias(c.categoriasJson)]));
  const porCat = new Map<string, number>();
  for (const ids of catsPorCaso.values()) for (const id of ids) porCat.set(id, (porCat.get(id) ?? 0) + 1);

  const porCategoria = CATEGORIAS.map((g) => ({
    grupo: g.grupo,
    color: g.color,
    barras: g.items
      .map((c) => ({ clave: c.id, etiqueta: c.nombre, valor: porCat.get(c.id) ?? 0 }))
      .filter((b) => b.valor > 0)
      .sort((a, b) => b.valor - a.valor)
  }));
  const porGrupo = CATEGORIAS.map((g) => ({
    clave: g.grupo,
    etiqueta: g.grupo,
    valor: casos.filter((c) => (catsPorCaso.get(c.id) ?? []).some((id) => CATEGORIA_POR_ID.get(id)?.grupo === g.grupo)).length
  })).sort((a, b) => b.valor - a.valor);

  // Cursos: cantidad de casos y el motivo más frecuente.
  const porCursoMap = contar(casos, (c) => c.cursoNombre ?? 'Sin curso');
  const porCurso = [...porCursoMap.entries()]
    .map(([curso, valor]) => {
      const cats = new Map<string, number>();
      for (const c of casos.filter((x) => (x.cursoNombre ?? 'Sin curso') === curso))
        for (const id of catsPorCaso.get(c.id) ?? []) cats.set(id, (cats.get(id) ?? 0) + 1);
      const top = [...cats.entries()].sort((a, b) => b[1] - a[1])[0];
      return {
        clave: curso,
        etiqueta: curso,
        valor,
        detalle: top ? `más frecuente: ${CATEGORIA_POR_ID.get(top[0])?.nombre}` : undefined
      };
    })
    .sort((a, b) => b.valor - a.valor);

  const nivelMap = contar(casos, (c) => String(c.nivel));
  const porNivel = [1, 2, 3].map((n) => ({ clave: String(n), etiqueta: `Nivel ${n}`, valor: nivelMap.get(String(n)) ?? 0 }));
  const estadoMap = contar(casos, (c) => c.estado);
  const porEstado = ESTADOS_CASO.map((e) => ({ clave: e.id, etiqueta: e.nombre, valor: estadoMap.get(e.id) ?? 0 }));
  const origenMap = contar(casos, (c) => c.origen);
  const ORIGEN: Record<string, string> = {
    derivacion: 'Derivación docente/preceptoría', alerta: 'Alerta temprana', gabinete: 'Detectado por el gabinete'
  };
  const porOrigen = Object.entries(ORIGEN).map(([k, etiqueta]) => ({ clave: k, etiqueta, valor: origenMap.get(k) ?? 0 }));

  const tipoMap = contar(intervenciones, (i) => i.tipo);
  const intervencionesPorTipo = TIPOS_INTERVENCION
    .map((t) => ({ clave: t.id, etiqueta: t.nombre, valor: tipoMap.get(t.id) ?? 0 }))
    .filter((b) => b.valor > 0)
    .sort((a, b) => b.valor - a.valor);
  const mesMap = contar(intervenciones, (i) => String(i.fecha).slice(0, 7));
  const intervencionesPorMes = mesesEntre(desde, hasta).map((ym) => ({
    clave: ym,
    etiqueta: `${MESES[Number(ym.slice(5)) - 1]} ${ym.slice(2, 4)}`,
    valor: mesMap.get(ym) ?? 0
  }));

  // Días desde que se abre el caso hasta la primera intervención real.
  const primeras = new Map<number, string>();
  const todasDeCasos = casos.length
    ? await db.select({ casoId: gabineteIntervenciones.casoId, fecha: gabineteIntervenciones.fecha, tipo: gabineteIntervenciones.tipo })
        .from(gabineteIntervenciones)
        .where(inArray(gabineteIntervenciones.casoId, casos.map((c) => c.id)))
    : [];
  const idsCasos = new Set(casos.map((c) => c.id));
  for (const i of todasDeCasos) {
    if (!idsCasos.has(i.casoId) || i.tipo === 'derivacion') continue;
    const f = String(i.fecha);
    const prev = primeras.get(i.casoId);
    if (!prev || f < prev) primeras.set(i.casoId, f);
  }
  const dias = casos
    .filter((c) => primeras.has(c.id))
    .map((c) => {
      const d = (new Date(`${primeras.get(c.id)}T12:00:00`).getTime() - new Date(c.createdAt).getTime()) / 86400000;
      return Math.max(0, Math.round(d));
    });

  return {
    desde,
    hasta,
    casosNuevos: casos.length,
    casosCerrados: cerrados.length,
    activosHoy: activos.length,
    urgentes: casos.filter((c) => (catsPorCaso.get(c.id) ?? []).some((id) => CATEGORIA_POR_ID.get(id)?.urgente)).length,
    derivacionesDocentes: origenMap.get('derivacion') ?? 0,
    medianaDiasPrimeraIntervencion: mediana(dias),
    totalIntervenciones: intervenciones.length,
    porCategoria,
    porGrupo,
    porCurso,
    porNivel,
    porEstado,
    porOrigen,
    intervencionesPorTipo,
    intervencionesPorMes
  };
}

/** CSV (separador ;, para Excel en español) con todas las tablas del período. */
export function estadisticasACsv(e: EstadisticasGabinete): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const filas: (string | number)[][] = [
    ['Gabinete psicopedagógico — estadísticas', `${e.desde} a ${e.hasta}`],
    [],
    ['Indicador', 'Valor'],
    ['Casos nuevos', e.casosNuevos],
    ['Casos cerrados', e.casosCerrados],
    ['Casos activos hoy', e.activosHoy],
    ['Casos con categoría urgente', e.urgentes],
    ['Derivaciones de docentes/preceptoría', e.derivacionesDocentes],
    ['Intervenciones registradas', e.totalIntervenciones],
    ['Mediana de días hasta la primera intervención', e.medianaDiasPrimeraIntervencion ?? ''],
    [],
    ['Grupo', 'Categoría', 'Casos'],
    ...e.porCategoria.flatMap((g) => g.barras.map((b) => [g.grupo, b.etiqueta, b.valor])),
    [],
    ['Curso', 'Casos', 'Motivo más frecuente'],
    ...e.porCurso.map((b) => [b.etiqueta, b.valor, b.detalle?.replace('más frecuente: ', '') ?? '']),
    [],
    ['Nivel de apoyo', 'Casos'],
    ...e.porNivel.map((b) => [b.etiqueta, b.valor]),
    [],
    ['Estado', 'Casos'],
    ...e.porEstado.map((b) => [b.etiqueta, b.valor]),
    [],
    ['Origen', 'Casos'],
    ...e.porOrigen.map((b) => [b.etiqueta, b.valor]),
    [],
    ['Tipo de intervención', 'Cantidad'],
    ...e.intervencionesPorTipo.map((b) => [b.etiqueta, b.valor]),
    [],
    ['Mes', 'Intervenciones'],
    ...e.intervencionesPorMes.map((b) => [b.etiqueta, b.valor])
  ];
  return '﻿' + filas.map((f) => f.map(esc).join(';')).join('\r\n');
}
