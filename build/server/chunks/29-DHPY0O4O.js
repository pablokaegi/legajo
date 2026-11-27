import { x as esAdmin } from './authz-BVdVv-6k.js';
import { r as registrarAccion, i as ipDe } from './audit-Dz9I-BN1.js';
import { e as exigirGabinete } from './acceso-mvVGKflq.js';
import { c as categoriasValidas } from './categorias-BK8Z_nGh.js';
import { E as ESTADOS_CASO } from './guia-EGVtkUDu.js';
import { M as obtenerHistorialAgrupamientosDeAlumno } from './agrupamientos-f9JamgYJ.js';
import { c as companerosDeBanco } from './aula-3UKAWgDU.js';
import { c as casoAbiertoDe, b as crearCaso, l as listarCasos } from './gabinete-BuAqI7Yz.js';
import { o as obtenerLegajoAlumno } from './legajo-B-_0HiSq.js';
import { fail, redirect, error } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'node:crypto';
import './perfilAlumnos-DJX-vZkW.js';
import './client-Dsrb4zGp.js';
import './rest-qugARKMk.js';
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

const index = 29;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DDhOEGBd.js')).default;
const server_id = "src/routes/gabinete/alumno/[alumnoId]/+page.server.ts";
const imports = ["_app/immutable/nodes/29.D7GkBbYk.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/B8RcQQp0.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/M6KOCQrT.js","_app/immutable/chunks/DymAb4Hh.js","_app/immutable/chunks/BazlC4SX.js","_app/immutable/chunks/DP1Y9rhH.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=29-DHPY0O4O.js.map
