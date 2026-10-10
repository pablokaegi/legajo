import { error, fail, redirect } from '@sveltejs/kit';
import { listarAlumnosDeCurso, listarCursos } from '$lib/server/services/cursos.js';
import {
  alertaDelCurso,
  casosAbiertosPorAlumno,
  casoAbiertoDe,
  crearCaso
} from '$lib/server/services/gabinete.js';
import { exigirGabinete } from '$lib/server/gabinete/acceso.js';
import { motivoDesdeAlerta, UMBRALES } from '$lib/server/gabinete/alerta.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import type { AlumnoRef } from '$lib/server/agrupamientos/tipos.js';
import type { PageServerLoad, Actions } from './$types';

function cursoId(param: string): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) error(400, 'Curso inválido');
  return id;
}

async function rosterDe(id: number): Promise<AlumnoRef[]> {
  return (await listarAlumnosDeCurso(id).catch(() => [])).map((u) => ({ id: u.id, nombre: u.fullname }));
}

async function nombreDelCurso(id: number): Promise<string> {
  const cursos = await listarCursos().catch(() => []);
  const c = cursos.find((x) => x.id === id);
  return c ? c.displayname || c.fullname : `Curso ${id}`;
}

export const load: PageServerLoad = async ({ locals, params, url }) => {
  await exigirGabinete(locals.usuario);
  const id = cursoId(params.cursoId);
  const conNotas = url.searchParams.get('notas') === '1';
  const [roster, cursoNombre] = await Promise.all([rosterDe(id), nombreDelCurso(id)]);
  const { filas, hayVotacion } = await alertaDelCurso(id, roster, { conNotas });
  const casos = await casosAbiertosPorAlumno(roster.map((a) => a.id));
  return {
    cursoId: id,
    cursoNombre,
    conNotas,
    hayVotacion,
    umbrales: UMBRALES,
    filas: filas.map((f) => ({ ...f, casoId: casos.get(f.id) ?? null }))
  };
};

export const actions: Actions = {
  // Abre un caso con el motivo armado por el sistema de alerta (no se toma del form).
  abrirCaso: async ({ request, locals, params }) => {
    const usuarioId = await exigirGabinete(locals.usuario);
    const id = cursoId(params.cursoId);
    const fd = await request.formData();
    const alumnoId = Number(fd.get('alumnoId'));
    const roster = await rosterDe(id);
    if (!roster.some((a) => a.id === alumnoId)) return fail(400, { error: 'Alumno inválido.' });

    const existente = await casoAbiertoDe(alumnoId);
    if (existente) throw redirect(303, `/gabinete/casos/${existente.id}`);

    const { filas } = await alertaDelCurso(id, roster, { conNotas: false });
    const fila = filas.find((f) => f.id === alumnoId)!;
    const casoId = await crearCaso({
      alumnoMoodleId: alumnoId,
      alumnoNombre: fila.nombre,
      cursoMoodleId: id,
      cursoNombre: await nombreDelCurso(id),
      motivo: motivoDesdeAlerta(fila),
      nivel: Math.max(2, fila.nivel),
      origen: 'alerta',
      estado: 'evaluacion',
      derivadoPor: usuarioId
    });
    await registrarAccion({
      usuarioId, accion: 'gabinete.caso.abrir', tablaDestino: 'gabinete_casos', idDestino: casoId, ip: ipDe(request)
    });
    throw redirect(303, `/gabinete/casos/${casoId}`);
  }
};
