import { q as esAdmin } from './authz-BOxGka1D.js';
import { r as registrarAccion, i as ipDe } from './audit-QNN2zM9t.js';
import { e as exigirGabinete } from './acceso-CmxXV0DQ.js';
import { c as categoriasValidas } from './categorias-BK8Z_nGh.js';
import { E as ESTADOS_CASO } from './guia-EGVtkUDu.js';
import { M as obtenerHistorialAgrupamientosDeAlumno } from './agrupamientos-C51657gi.js';
import { c as companerosDeBanco } from './aula-CacsvPHG.js';
import { c as casoAbiertoDe, b as crearCaso, l as listarCasos } from './gabinete-BwSSA8WI.js';
import { o as obtenerLegajoAlumno } from './legajo-DTS1gFKi.js';
import { fail, redirect, error } from '@sveltejs/kit';
import './db-DeyHlLbL.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'node:crypto';
import './perfilAlumnos-DTtq39Z_.js';
import './client-uxwLBcGc.js';
import './alerta-BpwCzyy7.js';

//#region src/routes/gabinete/alumno/[alumnoId]/+page.server.ts
function idDe(param) {
	const id = Number(param);
	if (!Number.isInteger(id) || id <= 0) error(400, "Alumno inválido");
	return id;
}
var load = async ({ locals, params }) => {
	const usuarioId = await exigirGabinete(locals.usuario);
	const alumnoId = idDe(params.alumnoId);
	const verTodas = await esAdmin(usuarioId);
	const [legajo, agrupamientos, casos, banco] = await Promise.all([
		obtenerLegajoAlumno(alumnoId, {
			usuarioId,
			verTodas
		}),
		obtenerHistorialAgrupamientosDeAlumno(alumnoId).catch(() => []),
		listarCasos({ alumnoMoodleId: alumnoId }),
		companerosDeBanco(alumnoId).catch(() => null)
	]);
	return {
		alumnoId,
		legajo,
		agrupamientos: agrupamientos.slice(0, 6),
		casos: casos.map((c) => ({
			...c.caso,
			responsable: c.responsable
		})),
		banco,
		estados: ESTADOS_CASO
	};
};
var actions = { abrirCaso: async ({ request, locals, params }) => {
	const usuarioId = await exigirGabinete(locals.usuario);
	const alumnoId = idDe(params.alumnoId);
	const fd = await request.formData();
	const motivo = String(fd.get("motivo") ?? "").trim().slice(0, 5e3);
	const nivel = Number(fd.get("nivel"));
	const categorias = categoriasValidas(fd.getAll("categoria"));
	if (categorias.length === 0) return fail(400, { error: "Elegí al menos una categoría." });
	if (!motivo) return fail(400, { error: "Escribí el motivo." });
	const existente = await casoAbiertoDe(alumnoId);
	if (existente) throw redirect(303, `/gabinete/casos/${existente.id}`);
	const legajo = await obtenerLegajoAlumno(alumnoId, {
		usuarioId,
		verTodas: false
	});
	const ultimaObs = legajo.observaciones[0];
	const casoId = await crearCaso({
		alumnoMoodleId: alumnoId,
		alumnoNombre: legajo.alumnoNombre,
		cursoMoodleId: ultimaObs?.cursoMoodleId ?? null,
		cursoNombre: ultimaObs?.cursoNombre ?? null,
		motivo,
		categorias,
		nivel: [
			1,
			2,
			3
		].includes(nivel) ? nivel : 2,
		origen: "gabinete",
		estado: "evaluacion",
		derivadoPor: usuarioId
	});
	await registrarAccion({
		usuarioId,
		accion: "gabinete.caso.abrir",
		tablaDestino: "gabinete_casos",
		idDestino: casoId,
		ip: ipDe(request)
	});
	throw redirect(303, `/gabinete/casos/${casoId}`);
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 28;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BwDCZg9d.js')).default;
const server_id = "src/routes/gabinete/alumno/[alumnoId]/+page.server.ts";
const imports = ["_app/immutable/nodes/28.Cr4o_yNB.js","_app/immutable/chunks/BUJoxPBc.js","_app/immutable/chunks/BFfF0FqC.js","_app/immutable/chunks/3l6Q5lPp.js","_app/immutable/chunks/D-v2tPeI.js","_app/immutable/chunks/C8H49NTu.js","_app/immutable/chunks/HpYZaN86.js","_app/immutable/chunks/Cv0aXPBq.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=28-CbIY_21C.js.map
