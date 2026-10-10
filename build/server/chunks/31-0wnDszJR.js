import { r as registrarAccion } from './audit-QNN2zM9t.js';
import { e as exigirGabinete } from './acceso-CmxXV0DQ.js';
import { p as parseCategorias } from './categorias-BK8Z_nGh.js';
import { T as TIPOS_INTERVENCION, E as ESTADOS_CASO } from './guia-EGVtkUDu.js';
import { M as obtenerHistorialAgrupamientosDeAlumno } from './agrupamientos-C51657gi.js';
import { o as obtenerCaso, f as listarEquipoGabinete, g as alertaDelCurso } from './gabinete-BwSSA8WI.js';
import { error } from '@sveltejs/kit';
import './db-DeyHlLbL.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './authz-BOxGka1D.js';
import 'drizzle-orm';
import 'node:crypto';
import './perfilAlumnos-DTtq39Z_.js';
import './client-uxwLBcGc.js';
import './alerta-BpwCzyy7.js';

//#region src/routes/gabinete/casos/[id]/informe/+page.server.ts
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
const component = async () => component_cache ??= (await import('./_page.svelte-QgoFZl_o.js')).default;
const server_id = "src/routes/gabinete/casos/[id]/informe/+page.server.ts";
const imports = ["_app/immutable/nodes/31.CwX0IGmk.js","_app/immutable/chunks/BUJoxPBc.js","_app/immutable/chunks/C8H49NTu.js","_app/immutable/chunks/DsHk46bm.js","_app/immutable/chunks/DuRwxM2R.js","_app/immutable/chunks/Cv0aXPBq.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=31-0wnDszJR.js.map
