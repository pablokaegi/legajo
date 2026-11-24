import { b as listarAlumnosDeCurso, a as listarCursos } from './cursos2-BuIc_Cww.js';
import { c as casoAbiertoDe, g as alertaDelCurso, b as crearCaso, h as casosAbiertosPorAlumno } from './gabinete-C3k7P2xt.js';
import { e as exigirGabinete } from './acceso-B66Nug0v.js';
import { m as motivoDesdeAlerta, U as UMBRALES } from './alerta-BSs4IT19.js';
import { r as registrarAccion, i as ipDe } from './audit-DjKqoMaH.js';
import { b as categoriasDesdeAlerta } from './categorias-BW0OCDku.js';
import { fail, redirect, error } from '@sveltejs/kit';
import './client-txz_W3Xb.js';
import './db-D7hI4G6x.js';
import './index.js-D6_LEqEo.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './perfilAlumnos-0dDRb6h3.js';
import './agrupamientos-Dx_h0nb5.js';
import './authz-DQJuia-E.js';
import 'node:crypto';
import './guia-YkJkXwF5.js';

// src/routes/gabinete/curso/[cursoId]/+page.server.ts
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

const index = 32;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BAr1nxg4.js')).default;
const server_id = "src/routes/gabinete/curso/[cursoId]/+page.server.ts";
const imports = ["_app/immutable/nodes/32.eL_hM20E.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js","_app/immutable/chunks/DeF1vw6K.js","_app/immutable/chunks/Bzau-lkd.js","_app/immutable/chunks/C0D3a8lr.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=32-CGFeDUvE.js.map
