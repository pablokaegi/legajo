import { error, fail, redirect } from '@sveltejs/kit';
import { obtenerLegajoAlumno } from '$lib/server/services/legajo.js';
import { obtenerHistorialAgrupamientosDeAlumno } from '$lib/server/services/agrupamientos.js';
import { listarCasos, casoAbiertoDe, crearCaso } from '$lib/server/services/gabinete.js';
import { companerosDeBanco } from '$lib/server/services/aula.js';
import { esAdmin } from '$lib/server/services/authz.js';
import { exigirGabinete } from '$lib/server/gabinete/acceso.js';
import { ESTADOS_CASO } from '$lib/server/gabinete/guia.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import { categoriasValidas } from '$lib/gabinete/categorias.js';
import type { PageServerLoad, Actions } from './$types';

function idDe(param: string): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) error(400, 'Alumno inválido');
  return id;
}

export const load: PageServerLoad = async ({ locals, params }) => {
  const usuarioId = await exigirGabinete(locals.usuario);
  const alumnoId = idDe(params.alumnoId);
  const verTodas = await esAdmin(usuarioId);
  const [legajo, agrupamientos, casos, banco] = await Promise.all([
    obtenerLegajoAlumno(alumnoId, { usuarioId, verTodas }),
    obtenerHistorialAgrupamientosDeAlumno(alumnoId).catch(() => []),
    listarCasos({ alumnoMoodleId: alumnoId }),
    companerosDeBanco(alumnoId).catch(() => null)
  ]);
  return {
    alumnoId,
    legajo,
    agrupamientos: agrupamientos.slice(0, 6),
    casos: casos.map((c) => ({ ...c.caso, responsable: c.responsable })),
    banco,
    estados: ESTADOS_CASO
  };
};

export const actions: Actions = {
  abrirCaso: async ({ request, locals, params }) => {
    const usuarioId = await exigirGabinete(locals.usuario);
    const alumnoId = idDe(params.alumnoId);
    const fd = await request.formData();
    const motivo = String(fd.get('motivo') ?? '').trim().slice(0, 5000);
    const nivel = Number(fd.get('nivel'));
    const categorias = categoriasValidas(fd.getAll('categoria'));
    if (categorias.length === 0) return fail(400, { error: 'Elegí al menos una categoría.' });
    if (!motivo) return fail(400, { error: 'Escribí el motivo.' });
    const existente = await casoAbiertoDe(alumnoId);
    if (existente) throw redirect(303, `/gabinete/casos/${existente.id}`);

    const legajo = await obtenerLegajoAlumno(alumnoId, { usuarioId, verTodas: false });
    const ultimaObs = legajo.observaciones[0];
    const casoId = await crearCaso({
      alumnoMoodleId: alumnoId,
      alumnoNombre: legajo.alumnoNombre,
      cursoMoodleId: ultimaObs?.cursoMoodleId ?? null,
      cursoNombre: ultimaObs?.cursoNombre ?? null,
      motivo,
      categorias,
      nivel: [1, 2, 3].includes(nivel) ? nivel : 2,
      origen: 'gabinete',
      estado: 'evaluacion',
      derivadoPor: usuarioId
    });
    await registrarAccion({
      usuarioId, accion: 'gabinete.caso.abrir', tablaDestino: 'gabinete_casos', idDestino: casoId, ip: ipDe(request)
    });
    throw redirect(303, `/gabinete/casos/${casoId}`);
  }
};
