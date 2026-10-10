import { error, fail } from '@sveltejs/kit';
import {
  obtenerCaso,
  actualizarCaso,
  agregarIntervencion,
  listarEquipoGabinete
} from '$lib/server/services/gabinete.js';
import { exigirGabinete } from '$lib/server/gabinete/acceso.js';
import {
  ESTADOS_CASO,
  ESTADO_IDS,
  TIPOS_INTERVENCION,
  TIPO_IDS,
  GUIA_POR_NIVEL,
  DIAS_REVISION,
  fechaMasDias
} from '$lib/server/gabinete/guia.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import { categoriasValidas, parseCategorias } from '$lib/gabinete/categorias.js';
import type { PageServerLoad, Actions } from './$types';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

function idDe(param: string): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) error(400, 'Caso inválido');
  return id;
}

export const load: PageServerLoad = async ({ locals, params }) => {
  await exigirGabinete(locals.usuario);
  const caso = await obtenerCaso(idDe(params.id));
  if (!caso) error(404, 'Caso no encontrado');
  return {
    ...caso,
    categorias: parseCategorias(caso.caso.categoriasJson),
    equipo: await listarEquipoGabinete(),
    estados: ESTADOS_CASO,
    tipos: TIPOS_INTERVENCION,
    guia: GUIA_POR_NIVEL,
    hoy: new Date().toISOString().slice(0, 10)
  };
};

export const actions: Actions = {
  actualizar: async ({ request, locals, params }) => {
    const usuarioId = await exigirGabinete(locals.usuario);
    const id = idDe(params.id);
    const actual = await obtenerCaso(id);
    if (!actual) return fail(404, { error: 'Caso no encontrado.' });
    const fd = await request.formData();

    const estado = String(fd.get('estado') ?? '');
    const nivel = Number(fd.get('nivel'));
    const respRaw = String(fd.get('responsableId') ?? '');
    const revision = String(fd.get('proximaRevision') ?? '').trim();
    const motivo = String(fd.get('motivo') ?? '').trim().slice(0, 5000);
    const fortalezas = String(fd.get('fortalezas') ?? '').trim().slice(0, 3000) || null;
    const categorias = categoriasValidas(fd.getAll('categoria'));

    if (!ESTADO_IDS.includes(estado)) return fail(400, { error: 'Estado inválido.' });
    if (![1, 2, 3].includes(nivel)) return fail(400, { error: 'Nivel inválido.' });
    if (revision && !FECHA.test(revision)) return fail(400, { error: 'Fecha de revisión inválida.' });
    if (!motivo) return fail(400, { error: 'El motivo no puede quedar vacío.' });
    const equipo = await listarEquipoGabinete();
    const responsableId = respRaw ? Number(respRaw) : null;
    if (responsableId != null && !equipo.some((p) => p.id === responsableId))
      return fail(400, { error: 'El responsable tiene que ser del gabinete.' });

    // Si cambió el nivel y no se indicó fecha, se reprograma según el nivel.
    const proximaRevision = estado === 'cerrado'
      ? null
      : revision || (nivel !== actual.caso.nivel ? fechaMasDias(DIAS_REVISION[nivel]) : actual.caso.proximaRevision);

    await actualizarCaso(id, {
      estado, nivel, responsableId, proximaRevision, motivo, fortalezas,
      categoriasJson: JSON.stringify(categorias)
    });
    await registrarAccion({
      usuarioId, accion: 'gabinete.caso.actualizar', tablaDestino: 'gabinete_casos', idDestino: id,
      payload: { estado, nivel }, ip: ipDe(request)
    });
    return { ok: 'Caso actualizado.' };
  },

  intervencion: async ({ request, locals, params }) => {
    const usuarioId = await exigirGabinete(locals.usuario);
    const id = idDe(params.id);
    const actual = await obtenerCaso(id);
    if (!actual) return fail(404, { error: 'Caso no encontrado.' });
    const fd = await request.formData();
    const tipo = String(fd.get('tipo') ?? '');
    const fecha = String(fd.get('fecha') ?? '');
    const descripcion = String(fd.get('descripcion') ?? '').trim().slice(0, 5000);
    const acuerdos = String(fd.get('acuerdos') ?? '').trim().slice(0, 3000) || null;
    const revision = String(fd.get('proximaRevision') ?? '').trim();
    const visibleFamilia = fd.get('visibleFamilia') === '1';
    if (!TIPO_IDS.includes(tipo)) return fail(400, { error: 'Tipo de registro inválido.' });
    if (!FECHA.test(fecha)) return fail(400, { error: 'Fecha inválida.' });
    if (!descripcion) return fail(400, { error: 'Describí brevemente qué se hizo.' });
    if (revision && !FECHA.test(revision)) return fail(400, { error: 'Fecha de revisión inválida.' });

    await agregarIntervencion({ casoId: id, tipo, fecha, descripcion, acuerdos, visibleFamilia, autorId: usuarioId });
    // Registrar algo mueve el caso: derivado → evaluación; y reprograma la revisión.
    const cambios: { estado?: string; proximaRevision?: string } = {};
    if (actual.caso.estado === 'derivado') cambios.estado = 'evaluacion';
    cambios.proximaRevision = revision || fechaMasDias(DIAS_REVISION[actual.caso.nivel] ?? 28);
    await actualizarCaso(id, cambios);
    await registrarAccion({
      usuarioId, accion: 'gabinete.intervencion', tablaDestino: 'gabinete_casos', idDestino: id,
      payload: { tipo }, ip: ipDe(request)
    });
    return { ok: 'Registro agregado.' };
  }
};
