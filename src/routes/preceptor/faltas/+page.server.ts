import { redirect } from '@sveltejs/kit';
import { listarFaltasConAlumnos } from '$lib/server/services/faltas.js';
import { alcancePreceptoria } from '$lib/server/services/authz.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  const page   = parseInt(url.searchParams.get('page')   ?? '1', 10);
  const curso  = url.searchParams.get('curso')  ?? undefined;
  const alumno = url.searchParams.get('alumno') ?? undefined;

  const lista = await listarFaltasConAlumnos({
    page,
    cursosPermitidos: await alcancePreceptoria(locals.usuario.usuarioId),
    cursoQ:  curso  ? curso.trim()  : undefined,
    alumnoQ: alumno ? alumno.trim() : undefined
  });

  return { lista, page, cursoQ: curso ?? '', alumnoQ: alumno ?? '' };
};
