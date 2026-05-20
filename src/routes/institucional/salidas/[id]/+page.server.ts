import { redirect, error, fail } from '@sveltejs/kit';
import {
  obtenerSalida,
  editarSalida,
  listarAutorizacionesDeSalida,
  crearAutorizacionesDeSalida
} from '$lib/server/services/salidas.js';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  const id = parseInt(params.id, 10);
  if (isNaN(id)) error(400, 'ID inválido');
  const salida = await obtenerSalida(id);
  if (!salida) error(404, 'Salida no encontrada');
  const autorizaciones = await listarAutorizacionesDeSalida(id);
  return { salida, autorizaciones, imprimir: url.searchParams.has('imprimir') };
};

export const actions: Actions = {
  editar: async ({ request, locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const id = parseInt(params.id, 10);
    const fd = await request.formData();
    const titulo            = (fd.get('titulo') as string)?.trim();
    const fecha             = (fd.get('fecha') as string)?.trim();
    const destino           = (fd.get('destino') as string)?.trim();
    const responsableNombre = (fd.get('responsableNombre') as string)?.trim();
    const cursoNombre       = (fd.get('cursoNombre') as string)?.trim();
    if (!titulo || !fecha || !destino || !responsableNombre || !cursoNombre)
      return fail(400, { error: 'Completá todos los campos obligatorios' });
    const cantRaw = parseInt(fd.get('cantidadAlumnos') as string, 10);
    await editarSalida(id, {
      titulo, fecha, destino, responsableNombre, cursoNombre,
      descripcion:     (fd.get('descripcion') as string)?.trim() || null,
      cantidadAlumnos: isNaN(cantRaw) ? null : cantRaw,
      costoEstimado:   (fd.get('costoEstimado') as string)?.trim() || null,
      estado:          (fd.get('estado') as string) || 'borrador',
      notas:           (fd.get('notas') as string)?.trim() || null
    });
    throw redirect(303, `/institucional/salidas/${id}`);
  },

  agregarAlumnos: async ({ request, locals, params }) => {
    if (!locals.usuario) throw redirect(303, '/auth');
    const id = parseInt(params.id, 10);
    const fd = await request.formData();

    let alumnos: Array<{ alumnoMoodleId: number; alumnoNombre: string }> = [];
    try {
      const raw = String(fd.get('alumnos') ?? '[]');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return fail(400, { errorAlumnos: 'Datos inválidos' });
      alumnos = parsed
        .map((a: { alumnoMoodleId: unknown; alumnoNombre: unknown }) => ({
          alumnoMoodleId: Number(a.alumnoMoodleId),
          alumnoNombre:   String(a.alumnoNombre ?? '')
        }))
        .filter(a => a.alumnoMoodleId > 0 && a.alumnoNombre.length > 0);
    } catch {
      return fail(400, { errorAlumnos: 'Datos inválidos' });
    }

    if (alumnos.length === 0) return fail(400, { errorAlumnos: 'Seleccioná al menos un alumno' });

    await crearAutorizacionesDeSalida(id, alumnos);
    throw redirect(303, `/institucional/salidas/${id}`);
  }
};
