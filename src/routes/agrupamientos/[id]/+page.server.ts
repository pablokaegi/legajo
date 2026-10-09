import { redirect, error, fail } from '@sveltejs/kit';
import {
  editarSesion,
  eliminarSesion,
  listarVotos,
  eliminarVoto,
  eliminarTodosLosVotos,
  generarTokenVoto,
  quitarTokenVoto,
  generarVotosAleatorios,
  puedeGestionarSesion
} from '$lib/server/services/agrupamientos.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import { esAdmin } from '$lib/server/services/authz.js';
import { exigirSesion } from '$lib/server/agrupamientos/acceso.js';
import type { AlumnoRef } from '$lib/server/agrupamientos/tipos.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const { sesion, usuarioId } = await exigirSesion(locals.usuario, params.id, 'ver');

  const roster: AlumnoRef[] = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => []))
    .map((u) => ({ id: u.id, nombre: u.fullname }));

  const votos = await listarVotos(sesion.id);
  const puedeGestionar = await puedeGestionarSesion(usuarioId, sesion);
  const puedeSimular = await esAdmin(usuarioId);
  return { sesion, roster, votos, puedeGestionar, puedeSimular };
};

export const actions: Actions = {
  editarSesion: async ({ request, locals, params }) => {
    const { sesion } = await exigirSesion(locals.usuario, params.id, 'gestionar');
    const fd = await request.formData();
    const titulo = (fd.get('titulo') as string)?.trim();
    const fecha = (fd.get('fecha') as string)?.trim();
    const notas = (fd.get('notas') as string)?.trim() || null;
    const cantRaw = parseInt((fd.get('cantidadEvaluar') as string) ?? '5', 10);
    const cantidadEvaluar = isNaN(cantRaw) ? 5 : Math.max(1, Math.min(10, cantRaw));
    if (!titulo || !fecha) return fail(400, { error: 'Completá el título y la fecha.' });
    await editarSesion(sesion.id, { titulo, fecha, notas, cantidadEvaluar });
    return { ok: true };
  },

  cambiarEstado: async ({ request, locals, params }) => {
    const { sesion } = await exigirSesion(locals.usuario, params.id, 'gestionar');
    const fd = await request.formData();
    const estado = fd.get('estado')?.toString() === 'cerrada' ? 'cerrada' : 'abierta';
    await editarSesion(sesion.id, { estado });
    return { ok: true };
  },

  generarToken: async ({ locals, params }) => {
    const { sesion } = await exigirSesion(locals.usuario, params.id, 'gestionar');
    await generarTokenVoto(sesion.id);
    return { ok: true };
  },

  quitarToken: async ({ locals, params }) => {
    const { sesion } = await exigirSesion(locals.usuario, params.id, 'gestionar');
    await quitarTokenVoto(sesion.id);
    return { ok: true };
  },

  eliminarVoto: async ({ request, locals, params }) => {
    const { sesion } = await exigirSesion(locals.usuario, params.id, 'gestionar');
    const fd = await request.formData();
    const votoId = parseInt(fd.get('votoId')?.toString() ?? '0', 10);
    if (votoId) await eliminarVoto(sesion.id, votoId);
    return { ok: true };
  },

  // Votos de prueba: contaminan el sociograma real (y el legajo), solo admin.
  generarAleatorio: async ({ locals, params }) => {
    const { sesion, usuarioId } = await exigirSesion(locals.usuario, params.id, 'gestionar');
    if (!(await esAdmin(usuarioId))) error(403, 'Solo un administrador puede generar votos de prueba.');
    const roster: AlumnoRef[] = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => []))
      .map((u) => ({ id: u.id, nombre: u.fullname }));
    const generados = await generarVotosAleatorios(sesion.id, roster, sesion.cantidadEvaluar);
    return { ok: true, generados };
  },

  vaciarVotos: async ({ locals, params }) => {
    const { sesion } = await exigirSesion(locals.usuario, params.id, 'gestionar');
    await eliminarTodosLosVotos(sesion.id);
    return { ok: true };
  },

  eliminarSesion: async ({ locals, params }) => {
    const { sesion } = await exigirSesion(locals.usuario, params.id, 'gestionar');
    await eliminarSesion(sesion.id);
    throw redirect(303, '/agrupamientos');
  }
};
