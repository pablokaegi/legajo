import { error } from '@sveltejs/kit';
import { listarCursos, listarAlumnosDeCurso } from '$lib/server/services/cursos.js';
import {
  agrupacionesDelCurso,
  listarSesionesDelCurso,
  listarVotos,
  modoDe
} from '$lib/server/services/agrupamientos.js';
import { planoVigente, parseBancos } from '$lib/server/services/aula.js';
import { veTodasLasSesiones } from '$lib/server/services/authz.js';
import { exigirStaff } from '$lib/server/agrupamientos/acceso.js';
import { construirGrafo, agruparAlAzar } from '$lib/server/agrupamientos/grafo.js';
import type { AlumnoRef } from '$lib/server/agrupamientos/tipos.js';
import type { PageServerLoad } from './$types';

// Solo se envía al navegador lo que puede verse en una pantalla pública:
// nombres, grupos, roles y el plano. Los pedidos de "no quedar juntos" se usan
// para armar grupos al azar pero NUNCA se mandan a la pizarra.
export const load: PageServerLoad = async ({ locals, params, url }) => {
  const usuarioId = await exigirStaff(locals.usuario);
  const cursoId = Number(params.cursoId);
  if (!Number.isInteger(cursoId) || cursoId <= 0) error(400, 'Curso inválido');

  const [rosterMoodle, cursos, verTodas] = await Promise.all([
    listarAlumnosDeCurso(cursoId).catch(() => []),
    listarCursos().catch(() => []),
    veTodasLasSesiones(usuarioId)
  ]);
  const roster: AlumnoRef[] = rosterMoodle
    .map((u) => ({ id: u.id, nombre: u.fullname }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  const curso = cursos.find((c) => c.id === cursoId);

  const [plano, agrupaciones] = await Promise.all([
    planoVigente(cursoId),
    agrupacionesDelCurso(cursoId, { usuarioId, verTodas })
  ]);

  // Grupos al azar (opcional): ?azar=N&semilla=S
  const n = Number(url.searchParams.get('azar'));
  let azar: AlumnoRef[][] | null = null;
  if ([2, 3, 4, 5, 6].includes(n) && roster.length > 1) {
    const sesiones = (await listarSesionesDelCurso(cursoId)).reverse();
    let votos: Awaited<ReturnType<typeof listarVotos>> = [];
    let modo: 'nominacion' | 'calificacion' = 'nominacion';
    for (const s of sesiones) {
      votos = await listarVotos(s.id);
      if (votos.length) { modo = modoDe(s); break; }
    }
    const semilla = Number(url.searchParams.get('semilla')) || Date.now() % 1e9;
    azar = agruparAlAzar(construirGrafo(votos, roster, modo), n, semilla);
  }

  return {
    cursoId,
    cursoNombre: curso ? curso.displayname || curso.fullname : `Curso ${cursoId}`,
    roster,
    plano: plano ? { nombre: plano.nombre, columnas: plano.columnas, bancos: parseBancos(plano.bancosJson) } : null,
    agrupaciones,
    azar,
    azarTamano: azar ? n : null
  };
};
