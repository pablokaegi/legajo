import { r as registrarAccion } from './audit-pcDGE6k9.js';
import { e as exigirGabinete } from './acceso-UlskQ2Cm.js';
import { p as parseCategorias } from './categorias-BK8Z_nGh.js';
import { T as TIPOS_INTERVENCION, E as ESTADOS_CASO } from './guia-EGVtkUDu.js';
import { M as obtenerHistorialAgrupamientosDeAlumno } from './agrupamientos-DefKf2yH.js';
import { o as obtenerCaso, f as listarEquipoGabinete, g as alertaDelCurso } from './gabinete-BZkb7MV-.js';
import { error } from '@sveltejs/kit';
import './db-jrdBeEUG.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './authz-_wL7Hkka.js';
import 'drizzle-orm';
import 'node:crypto';
import './perfilAlumnos-BW2au5of.js';
import './client-BlwuPSaS.js';
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

const index = 32;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BLOMK6mp.js')).default;
const server_id = "src/routes/gabinete/casos/[id]/informe/+page.server.ts";
const imports = ["_app/immutable/nodes/32.CsTuGRfW.js","_app/immutable/chunks/CcZ_XLq7.js","_app/immutable/chunks/6xwAJV1g.js","_app/immutable/chunks/CbFdLoJc.js","_app/immutable/chunks/DIUcaIin.js","_app/immutable/chunks/Dx_QYFK8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=32-CHU98ck7.js.map
