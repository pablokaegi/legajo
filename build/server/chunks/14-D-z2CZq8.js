import { v as veTodasLasSesiones } from './authz-C2Zplj7X.js';
import { b as listarAlumnosDeCurso } from './cursos2-BTSWVjNq.js';
import { l as listarSesionesDelCurso, g as listarVotos, h as analizarRelacionesSociales, i as construirGrafo, f as modoDe, k as evaluacionesPorModo } from './agrupamientos-DwaMuOx0.js';
import { e as exigirStaff } from './acceso-CC5WrM6x.js';
import { error } from '@sveltejs/kit';
import './db-DnDhVbjt.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './client-CURRDhAR.js';
import 'node:crypto';

//#region src/routes/agrupamientos/curso/[cursoId]/+page.server.ts
var load = async ({ locals, params }) => {
	const usuarioId = await exigirStaff(locals.usuario);
	const cursoId = Number(params.cursoId);
	if (!Number.isInteger(cursoId) || cursoId <= 0) error(400, "Curso inválido");
	const verTodas = await veTodasLasSesiones(usuarioId);
	const sesiones = (await listarSesionesDelCurso(cursoId)).filter((s) => verTodas || s.createdBy === usuarioId);
	if (sesiones.length === 0) error(404, "No hay sesiones de este curso que puedas ver.");
	const roster = (await listarAlumnosDeCurso(cursoId).catch(() => [])).map((u) => ({
		id: u.id,
		nombre: u.fullname
	}));
	const columnas = [];
	const nombres = new Map(roster.map((a) => [a.id, a.nombre]));
	const celdas = /* @__PURE__ */ new Map();
	for (const [k, s] of sesiones.entries()) {
		const votos = await listarVotos(s.id);
		const an = analizarRelacionesSociales(construirGrafo(votos, roster, modoDe(s)));
		const acomp = new Set(an?.paraAcompanar.map((p) => p.id) ?? []);
		columnas.push({
			id: s.id,
			titulo: s.titulo,
			fecha: String(s.fecha),
			modo: modoDe(s),
			votos: votos.length,
			participacion: an?.participacion ?? 0,
			reciprocidad: an?.porcentajeReciprocidad ?? 0,
			sinElecciones: an?.metricas.filter((m) => m.exposicion >= 3 && m.recibidas === 0).length ?? 0,
			acompanar: acomp.size,
			clima: an?.climaGrupal ?? "sin_datos"
		});
		for (const m of an?.metricas ?? []) {
			if (!nombres.has(m.id)) nombres.set(m.id, m.nombre);
			const fila = celdas.get(m.id) ?? Array.from({ length: sesiones.length }, () => null);
			fila[k] = m.exposicion > 0 ? {
				recibidas: m.recibidas,
				exposicion: m.exposicion,
				mutuas: m.mutuas,
				acompanar: acomp.has(m.id)
			} : null;
			celdas.set(m.id, fila);
		}
	}
	const alumnos = [...nombres.entries()].map(([id, nombre]) => {
		const fila = celdas.get(id) ?? Array.from({ length: sesiones.length }, () => null);
		const conDatos = fila.filter((c) => c != null);
		const sostenida = conDatos.slice(-3).filter((c) => c.acompanar).length >= 2;
		const tasa = (c) => c.recibidas / Math.max(1, c.exposicion);
		let tendencia = null;
		if (sostenida) tendencia = "sostenida";
		else if (conDatos.length >= 2) {
			const primera = conDatos[0];
			const ultima = conDatos[conDatos.length - 1];
			if (primera.acompanar && !ultima.acompanar && tasa(ultima) > tasa(primera)) tendencia = "mejora";
			else if (!primera.acompanar && ultima.acompanar) tendencia = "empeora";
		}
		return {
			id,
			nombre,
			fila,
			tendencia
		};
	}).sort((a, b) => {
		const peso = {
			sostenida: 0,
			empeora: 1,
			mejora: 2
		};
		return (peso[a.tendencia ?? ""] ?? 3) - (peso[b.tendencia ?? ""] ?? 3) || a.nombre.localeCompare(b.nombre, "es");
	});
	return {
		cursoId,
		cursoNombre: sesiones[0].cursoNombre,
		columnas,
		alumnos,
		evaluaciones: await evaluacionesPorModo(sesiones.map((s) => s.id))
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 14;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BYKmOzVG.js')).default;
const server_id = "src/routes/agrupamientos/curso/[cursoId]/+page.server.ts";
const imports = ["_app/immutable/nodes/14.AuZkSy3x.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=14-D-z2CZq8.js.map
