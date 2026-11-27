import { r as registrarAccion, i as ipDe } from './audit-Dz9I-BN1.js';
import { b as listarAlumnosDeCurso, a as listarCursos } from './cursos2-pDrqIz-A.js';
import { e as exigirGabinete } from './acceso-mvVGKflq.js';
import { b as categoriasDesdeAlerta } from './categorias-BK8Z_nGh.js';
import { m as motivoDesdeAlerta, U as UMBRALES } from './alerta-BpwCzyy7.js';
import { c as casoAbiertoDe, g as alertaDelCurso, b as crearCaso, h as casosAbiertosPorAlumno } from './gabinete-BuAqI7Yz.js';
import { fail, redirect, error } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './client-Dsrb4zGp.js';
import './rest-qugARKMk.js';
import 'drizzle-orm';
import './authz-BVdVv-6k.js';
import './guia-EGVtkUDu.js';
import './agrupamientos-f9JamgYJ.js';
import 'node:crypto';
import './perfilAlumnos-DJX-vZkW.js';

//#region src/routes/gabinete/curso/[cursoId]/+page.server.ts
function cursoId(param) {
	const id = Number(param);
	if (!Number.isInteger(id) || id <= 0) error(400, "Curso inválido");
	return id;
}
async function rosterDe(id) {
	return (await listarAlumnosDeCurso(id).catch(() => [])).map((u) => ({
		id: u.id,
		nombre: u.fullname
	}));
}
async function nombreDelCurso(id) {
	const c = (await listarCursos().catch(() => [])).find((x) => x.id === id);
	return c ? c.displayname || c.fullname : `Curso ${id}`;
}
var load = async ({ locals, params, url }) => {
	await exigirGabinete(locals.usuario);
	const id = cursoId(params.cursoId);
	const conNotas = url.searchParams.get("notas") === "1";
	const [roster, cursoNombre] = await Promise.all([rosterDe(id), nombreDelCurso(id)]);
	const { filas, hayVotacion } = await alertaDelCurso(id, roster, { conNotas });
	const casos = await casosAbiertosPorAlumno(roster.map((a) => a.id));
	return {
		cursoId: id,
		cursoNombre,
		conNotas,
		hayVotacion,
		umbrales: UMBRALES,
		filas: filas.map((f) => ({
			...f,
			casoId: casos.get(f.id) ?? null
		}))
	};
};
var actions = { abrirCaso: async ({ request, locals, params }) => {
	const usuarioId = await exigirGabinete(locals.usuario);
	const id = cursoId(params.cursoId);
	const fd = await request.formData();
	const alumnoId = Number(fd.get("alumnoId"));
	const roster = await rosterDe(id);
	if (!roster.some((a) => a.id === alumnoId)) return fail(400, { error: "Alumno inválido." });
	const existente = await casoAbiertoDe(alumnoId);
	if (existente) throw redirect(303, `/gabinete/casos/${existente.id}`);
	const { filas } = await alertaDelCurso(id, roster, { conNotas: false });
	const fila = filas.find((f) => f.id === alumnoId);
	const casoId = await crearCaso({
		alumnoMoodleId: alumnoId,
		alumnoNombre: fila.nombre,
		cursoMoodleId: id,
		cursoNombre: await nombreDelCurso(id),
		motivo: motivoDesdeAlerta(fila),
		categorias: categoriasDesdeAlerta(fila),
		nivel: Math.max(2, fila.nivel),
		origen: "alerta",
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

const index = 34;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Bk8OWp-E.js')).default;
const server_id = "src/routes/gabinete/curso/[cursoId]/+page.server.ts";
const imports = ["_app/immutable/nodes/34.WXvf7vxW.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/B8RcQQp0.js","_app/immutable/chunks/M6KOCQrT.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=34-2i6FAXp2.js.map
