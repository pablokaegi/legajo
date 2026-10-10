import { q as esAdmin } from './authz-C2Zplj7X.js';
import { r as registrarAccion, i as ipDe } from './audit-DcTc3_qL.js';
import { M as obtenerHistorialAgrupamientosDeAlumno } from './agrupamientos-DwaMuOx0.js';
import { e as exigirGabinete } from './acceso2-BZbylWqk.js';
import { c as companerosDeBanco } from './aula-BNi_I08Z.js';
import { E as ESTADOS_CASO } from './guia-Cz0z5vQo.js';
import { c as casoAbiertoDe, b as crearCaso, l as listarCasos } from './gabinete-BUkdUbGK.js';
import { o as obtenerLegajoAlumno } from './legajo-BuMlyz2a.js';
import { fail, redirect, error } from '@sveltejs/kit';
import './db-DnDhVbjt.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'node:crypto';
import './perfilAlumnos-LVNftgNy.js';
import './client-CURRDhAR.js';

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
const component = async () => component_cache ??= (await import('./_page.svelte-CPvmA4Bu.js')).default;
const server_id = "src/routes/gabinete/alumno/[alumnoId]/+page.server.ts";
const imports = ["_app/immutable/nodes/28.DSHWCftN.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/BI88GkAg.js","_app/immutable/chunks/BpBdz8fz.js","_app/immutable/chunks/BrKMbrgq.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=28-CETT46hW.js.map
