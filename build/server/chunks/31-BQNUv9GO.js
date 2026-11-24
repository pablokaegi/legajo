import { o as obtenerCaso, f as listarEquipoGabinete, g as alertaDelCurso } from './gabinete-C3k7P2xt.js';
import { M as obtenerHistorialAgrupamientosDeAlumno } from './agrupamientos-Dx_h0nb5.js';
import { e as exigirGabinete } from './acceso-B66Nug0v.js';
import { T as TIPOS_INTERVENCION, E as ESTADOS_CASO } from './guia-YkJkXwF5.js';
import { p as parseCategorias } from './categorias-BW0OCDku.js';
import { r as registrarAccion } from './audit-DjKqoMaH.js';
import { error } from '@sveltejs/kit';
import './db-D7hI4G6x.js';
import './index.js-D6_LEqEo.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './perfilAlumnos-0dDRb6h3.js';
import './client-txz_W3Xb.js';
import 'drizzle-orm';
import './alerta-BSs4IT19.js';
import './authz-DQJuia-E.js';
import 'node:crypto';

// src/routes/gabinete/casos/[id]/informe/+page.server.ts
var load = async ({ locals, params, url }) => {
	const usuarioId = await exigirGabinete(locals.usuario);
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) error(400, "Caso inválido");
	const caso = await obtenerCaso(id);
	if (!caso) error(404, "Caso no encontrado");
	const para = url.searchParams.get("para") === "familia" ? "familia" : "direccion";
	const c = caso.caso;
	const responsable = (await listarEquipoGabinete()).find((p) => p.id === c.responsableId)?.nombre ?? null;
	let indicadores = null;
	let vinculos = [];
	if (para === "direccion") {
		if (c.cursoMoodleId) indicadores = (await alertaDelCurso(c.cursoMoodleId, [{
			id: c.alumnoMoodleId,
			nombre: c.alumnoNombre
		}], { conNotas: true }).catch(() => null))?.filas[0] ?? null;
		vinculos = (await obtenerHistorialAgrupamientosDeAlumno(c.alumnoMoodleId).catch(() => [])).slice(0, 4);
	}
	const intervenciones = (para === "familia" ? caso.intervenciones.filter((r) => r.i.visibleFamilia) : caso.intervenciones).map((r) => ({
		...r.i,
		autor: r.autor
	}));
	await registrarAccion({
		usuarioId,
		accion: "gabinete.informe.caso",
		tablaDestino: "gabinete_casos",
		idDestino: id,
		payload: { para }
	});
	return {
		para,
		caso: {
			id: c.id,
			alumnoNombre: c.alumnoNombre,
			cursoNombre: c.cursoNombre,
			estado: c.estado,
			nivel: c.nivel,
			motivo: para === "direccion" ? c.motivo : null,
			fortalezas: c.fortalezas,
			proximaRevision: c.proximaRevision,
			createdAt: c.createdAt,
			derivadoPor: para === "direccion" ? caso.derivadoPorNombre : null
		},
		categorias: parseCategorias(c.categoriasJson),
		responsable,
		indicadores,
		vinculos,
		intervenciones,
		compartidasTotal: caso.intervenciones.filter((r) => r.i.visibleFamilia).length,
		estados: ESTADOS_CASO,
		tipos: TIPOS_INTERVENCION,
		emisor: locals.usuario.nombre
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 31;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CY9R9i-C.js')).default;
const server_id = "src/routes/gabinete/casos/[id]/informe/+page.server.ts";
const imports = ["_app/immutable/nodes/31.EMNBaGYb.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js","_app/immutable/chunks/B5ZQzlDl.js","_app/immutable/chunks/BED2mB-Q.js","_app/immutable/chunks/DuKVIOIg.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=31-BQNUv9GO.js.map
