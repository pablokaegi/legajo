import { error } from '@sveltejs/kit';
import { obtenerCaso, listarEquipoGabinete, alertaDelCurso } from '$lib/server/services/gabinete.js';
import { obtenerHistorialAgrupamientosDeAlumno } from '$lib/server/services/agrupamientos.js';
import { exigirGabinete } from '$lib/server/gabinete/acceso.js';
import { ESTADOS_CASO, TIPOS_INTERVENCION } from '$lib/server/gabinete/guia.js';
import { parseCategorias } from '$lib/gabinete/categorias.js';
import { registrarAccion } from '$lib/server/services/audit.js';
import type { PageServerLoad } from './$types';

// Dos versiones del informe de un caso:
// - dirección: completo (motivo, indicadores, historial íntegro, vínculos).
// - familia: lenguaje claro, fortalezas y SOLO las intervenciones marcadas como
//   compartibles; sin notas internas, sin indicadores ni datos de otros alumnos.
export const load: PageServerLoad = async ({ locals, params, url }) => {
  const usuarioId = await exigirGabinete(locals.usuario);
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) error(400, 'Caso inválido');
  const caso = await obtenerCaso(id);
  if (!caso) error(404, 'Caso no encontrado');
  const para = url.searchParams.get('para') === 'familia' ? 'familia' : 'direccion';
  const c = caso.caso;

  const equipo = await listarEquipoGabinete();
  const responsable = equipo.find((p) => p.id === c.responsableId)?.nombre ?? null;

  let indicadores = null;
  let vinculos: Awaited<ReturnType<typeof obtenerHistorialAgrupamientosDeAlumno>> = [];
  if (para === 'direccion') {
    if (c.cursoMoodleId) {
      const r = await alertaDelCurso(c.cursoMoodleId, [{ id: c.alumnoMoodleId, nombre: c.alumnoNombre }], {
        conNotas: true
      }).catch(() => null);
      indicadores = r?.filas[0] ?? null;
    }
    vinculos = (await obtenerHistorialAgrupamientosDeAlumno(c.alumnoMoodleId).catch(() => [])).slice(0, 4);
  }

  const intervenciones = (para === 'familia'
    ? caso.intervenciones.filter((r) => r.i.visibleFamilia)
    : caso.intervenciones
  ).map((r) => ({ ...r.i, autor: r.autor }));

  await registrarAccion({
    usuarioId, accion: 'gabinete.informe.caso', tablaDestino: 'gabinete_casos', idDestino: id, payload: { para }
  });

  return {
    para,
    caso: {
      id: c.id,
      alumnoNombre: c.alumnoNombre,
      cursoNombre: c.cursoNombre,
      estado: c.estado,
      nivel: c.nivel,
      motivo: para === 'direccion' ? c.motivo : null,
      fortalezas: c.fortalezas,
      proximaRevision: c.proximaRevision,
      createdAt: c.createdAt,
      derivadoPor: para === 'direccion' ? caso.derivadoPorNombre : null
    },
    categorias: parseCategorias(c.categoriasJson),
    responsable,
    indicadores,
    vinculos,
    intervenciones,
    compartidasTotal: caso.intervenciones.filter((r) => r.i.visibleFamilia).length,
    estados: ESTADOS_CASO,
    tipos: TIPOS_INTERVENCION,
    emisor: locals.usuario!.nombre
  };
};
