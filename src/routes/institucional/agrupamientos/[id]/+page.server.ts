import { redirect, error, fail } from '@sveltejs/kit';
import {
  obtenerSesion,
  editarSesion,
  eliminarSesion,
  listarVotos,
  guardarVoto,
  eliminarVoto
} from '$lib/server/services/agrupamientos.js';
import { listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import type { Calificacion } from '$lib/server/agrupamientos/tipos.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const id = parseInt(params.id, 10);
  if (isNaN(id)) error(400, 'ID inválido');

  const sesion = await obtenerSesion(id);
  if (!sesion) error(404, 'Sesión no encontrada');

  const roster = await listarAlumnosDeCurso(sesion.cursoMoodleId)
    .then((us) => us.map((u) => ({ id: u.id, nombre: u.fullname })))
    .catch(() => []);

  const votos = await listarVotos(id);
  return { sesion, roster, votos };
};

function parseCalificaciones(raw: string): Calificacion[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .map((c: { id: unknown; nombre: unknown; puntaje: unknown }) => ({
        id: Number(c.id),
        nombre: String(c.nombre ?? ''),
        puntaje: Number(c.puntaje)
      }))
      .filter((c: Calificacion) => c.id > 0 && c.puntaje >= 1 && c.puntaje <= 5);
  } catch {
    return [];
  }
}

export const actions: Actions = {
  guardarVoto: async ({ request, locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const id = parseInt(params.id, 10);
    const fd = await request.formData();

    const votanteMoodleId = parseInt(fd.get('votanteMoodleId')?.toString() ?? '0', 10);
    const votanteNombre = (fd.get('votanteNombre') as string)?.trim();
    if (!votanteMoodleId || !votanteNombre)
      return fail(400, { error: 'Alumno votante inválido.' });

    const calificaciones = parseCalificaciones(fd.get('calificaciones')?.toString() ?? '[]');
    if (calificaciones.length === 0)
      return fail(400, { error: 'Asigná al menos una calificación a un compañero.' });

    const bloqRaw = fd.get('bloqueadoMoodleId')?.toString();
    const bloqueadoMoodleId = bloqRaw ? parseInt(bloqRaw, 10) : null;
    const bloqueadoNombre = (fd.get('bloqueadoNombre') as string)?.trim() || null;

    try {
      await guardarVoto(id, {
        votanteMoodleId,
        votanteNombre,
        calificaciones,
        bloqueadoMoodleId: bloqueadoMoodleId && bloqueadoMoodleId > 0 ? bloqueadoMoodleId : null,
        bloqueadoNombre: bloqueadoMoodleId && bloqueadoMoodleId > 0 ? bloqueadoNombre : null
      });
    } catch (err) {
      return fail(500, { error: err instanceof Error ? err.message : 'Error al guardar el voto.' });
    }
    return { ok: true };
  },

  eliminarVoto: async ({ request, locals }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const fd = await request.formData();
    const votoId = parseInt(fd.get('votoId')?.toString() ?? '0', 10);
    if (!votoId) return fail(400, { error: 'Voto inválido.' });
    await eliminarVoto(votoId);
    return { ok: true };
  },

  editarSesion: async ({ request, locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const id = parseInt(params.id, 10);
    const fd = await request.formData();
    const titulo = (fd.get('titulo') as string)?.trim();
    const fecha = (fd.get('fecha') as string)?.trim();
    const notas = (fd.get('notas') as string)?.trim() || null;
    if (!titulo || !fecha)
      return fail(400, { error: 'Completá el título y la fecha.' });
    await editarSesion(id, { titulo, fecha, notas });
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

  eliminarSesion: async ({ locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const id = parseInt(params.id, 10);
    await eliminarSesion(id);
    throw redirect(303, '/institucional/agrupamientos');
  }
};
