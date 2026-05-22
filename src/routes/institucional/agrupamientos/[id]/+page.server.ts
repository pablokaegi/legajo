import { redirect, error, fail } from '@sveltejs/kit';
import {
  obtenerSesion,
  editarSesion,
  eliminarSesion,
  listarVotos,
  eliminarVoto,
  eliminarTodosLosVotos,
  generarTokenVoto,
  quitarTokenVoto,
  generarVotosAleatorios
} from '$lib/server/services/agrupamientos.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import type { AlumnoRef } from '$lib/server/agrupamientos/tipos.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const id = parseInt(params.id, 10);
  if (isNaN(id)) error(400, 'ID inválido');

  const sesion = await obtenerSesion(id);
  if (!sesion) error(404, 'Sesión no encontrada');

  const roster: AlumnoRef[] = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => []))
    .map((u) => ({ id: u.id, nombre: u.fullname }));

  const votos = await listarVotos(id);
  return { sesion, roster, votos };
};

export const actions: Actions = {
  editarSesion: async ({ request, locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const id = parseInt(params.id, 10);
    const fd = await request.formData();
    const titulo = (fd.get('titulo') as string)?.trim();
    const fecha = (fd.get('fecha') as string)?.trim();
    const notas = (fd.get('notas') as string)?.trim() || null;
    const cantRaw = parseInt((fd.get('cantidadEvaluar') as string) ?? '5', 10);
    const cantidadEvaluar = isNaN(cantRaw) ? 5 : Math.max(1, Math.min(10, cantRaw));
    if (!titulo || !fecha) return fail(400, { error: 'Completá el título y la fecha.' });
    await editarSesion(id, { titulo, fecha, notas, cantidadEvaluar });
    return { ok: true };
  },

  cambiarEstado: async ({ request, locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const id = parseInt(params.id, 10);
    const fd = await request.formData();
    const estado = fd.get('estado')?.toString() === 'cerrada' ? 'cerrada' : 'abierta';
    await editarSesion(id, { estado });
    return { ok: true };
  },

  generarToken: async ({ locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    await generarTokenVoto(parseInt(params.id, 10));
    return { ok: true };
  },

  quitarToken: async ({ locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    await quitarTokenVoto(parseInt(params.id, 10));
    return { ok: true };
  },

  eliminarVoto: async ({ request, locals }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const fd = await request.formData();
    const votoId = parseInt(fd.get('votoId')?.toString() ?? '0', 10);
    if (votoId) await eliminarVoto(votoId);
    return { ok: true };
  },

  generarAleatorio: async ({ locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const id = parseInt(params.id, 10);
    const sesion = await obtenerSesion(id);
    if (!sesion) return fail(404, { error: 'Sesión no encontrada.' });
    const roster: AlumnoRef[] = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => []))
      .map((u) => ({ id: u.id, nombre: u.fullname }));
    const generados = await generarVotosAleatorios(id, roster, sesion.cantidadEvaluar);
    return { ok: true, generados };
  },

  vaciarVotos: async ({ locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    await eliminarTodosLosVotos(parseInt(params.id, 10));
    return { ok: true };
  },

  eliminarSesion: async ({ locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    await eliminarSesion(parseInt(params.id, 10));
    throw redirect(303, '/institucional/agrupamientos');
  }
};
