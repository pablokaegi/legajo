import { r as registrarAccion } from './audit-Dz9I-BN1.js';
import { e as exigirGabinete } from './acceso-mvVGKflq.js';
import { p as parseCategorias } from './categorias-BK8Z_nGh.js';
import { T as TIPOS_INTERVENCION, E as ESTADOS_CASO } from './guia-EGVtkUDu.js';
import { M as obtenerHistorialAgrupamientosDeAlumno } from './agrupamientos-f9JamgYJ.js';
import { o as obtenerCaso, f as listarEquipoGabinete, g as alertaDelCurso } from './gabinete-BuAqI7Yz.js';
import { error } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './authz-BVdVv-6k.js';
import 'drizzle-orm';
import 'node:crypto';
import './perfilAlumnos-DJX-vZkW.js';
import './client-Dsrb4zGp.js';
import './rest-qugARKMk.js';
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

const index = 33;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-C-yKeFbA.js')).default;
const server_id = "src/routes/gabinete/casos/[id]/informe/+page.server.ts";
const imports = ["_app/immutable/nodes/33.DgqxofZA.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js","_app/immutable/chunks/Aloq5GB_.js","_app/immutable/chunks/4WnCJOoR.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/DP1Y9rhH.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=33-DD5m2zWQ.js.map
