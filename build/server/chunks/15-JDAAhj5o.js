import { b as listarAlumnosDeCurso } from './cursos2-CO8sxrLe.js';
import { c as listarVotos, e as construirGrafo, f as modoDe, d as analizarRelacionesSociales, u as redondear } from './agrupamientos-Bz0E4k6X.js';
import { a as exigirSesion } from './acceso-1KCvqAgn.js';
import { p as parsePrediccion, c as compararPrediccion } from './sintonia-3BS8uGlU.js';
import { o as obtenerConducta } from './perfilAlumnos-EOzVLgao.js';
import './client-Bg6wabNy.js';
import './shared-server-asDUS7ug.js';
import './db-CnhT25Eo.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './authz-C29w6V7D.js';
import 'node:crypto';
import '@sveltejs/kit';

//#region src/lib/server/agrupamientos/estadisticas.ts
function calcularEstadisticas(g, votos) {
	if (g.votantes.size === 0) return null;
	const ref = (id) => ({
		id,
		nombre: g.nombre(id)
	});
	let totalElecciones = 0;
	for (const a of g.votantes) totalElecciones += g.eleccionesDe(a).length;
	let distribucion;
	if (g.modo === "nominacion") {
		const hist = /* @__PURE__ */ new Map();
		for (const a of g.alumnos) {
			const k = Math.min(g.recibidas(a.id), 5);
			hist.set(k, (hist.get(k) ?? 0) + 1);
		}
		distribucion = [
			0,
			1,
			2,
			3,
			4,
			5
		].map((k) => ({
			etiqueta: k === 5 ? "5 o más" : k === 1 ? "1 elección" : `${k} elecciones`,
			cantidad: hist.get(k) ?? 0
		}));
	} else {
		const hist = {
			1: 0,
			2: 0,
			3: 0,
			4: 0,
			5: 0
		};
		for (const v of votos) for (const c of v.calificaciones) hist[c.puntaje] = (hist[c.puntaje] ?? 0) + 1;
		distribucion = [
			5,
			4,
			3,
			2,
			1
		].map((p) => ({
			etiqueta: `Puntaje ${p}`,
			cantidad: hist[p]
		}));
	}
	const masElegidos = g.alumnos.map((a) => ({
		id: a.id,
		nombre: a.nombre,
		recibidas: g.recibidas(a.id),
		exposicion: g.exposicion(a.id)
	})).filter((x) => x.recibidas > 0).sort((x, y) => y.recibidas - x.recibidas || x.nombre.localeCompare(y.nombre, "es"));
	const masBloqueados = g.alumnos.map((a) => ({
		id: a.id,
		nombre: a.nombre,
		cantidad: g.rechazosRecibidos(a.id)
	})).filter((x) => x.cantidad > 0).sort((x, y) => y.cantidad - x.cantidad);
	const pidio = /* @__PURE__ */ new Map();
	for (const v of votos) if (v.bloqueadoMoodleId != null) pidio.set(v.votanteMoodleId, v.bloqueadoMoodleId);
	const bloqueosMutuos = g.paresBloqueados.filter(([a, b]) => pidio.get(a) === b && pidio.get(b) === a).map(([a, b]) => ({
		a: ref(a),
		b: ref(b)
	}));
	const totalCurso = g.alumnos.length;
	return {
		modo: g.modo,
		totalVotantes: g.votantes.size,
		totalCurso,
		participacion: totalCurso > 0 ? redondear(g.votantes.size / totalCurso * 100, 1) : 0,
		totalElecciones,
		totalBloqueos: pidio.size,
		distribucion,
		masElegidos,
		masBloqueados,
		bloqueosMutuos,
		mutuas: g.paresMutuos.map(([a, b]) => ({
			a: ref(a),
			b: ref(b)
		}))
	};
}
//#endregion
//#region src/routes/agrupamientos/[id]/estadisticas/+page.server.ts
var load = async ({ locals, params }) => {
	const { sesion } = await exigirSesion(locals.usuario, params.id, "ver");
	const roster = await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => []);
	const votos = await listarVotos(sesion.id);
	const grafo = construirGrafo(votos, roster.map((u) => ({
		id: u.id,
		nombre: u.fullname
	})), modoDe(sesion));
	const stats = calcularEstadisticas(grafo, votos);
	const analisis = analizarRelacionesSociales(grafo);
	const prediccion = parsePrediccion(sesion.prediccionJson);
	const sintonia = prediccion && analisis ? compararPrediccion(prediccion, analisis, grafo.nombre) : null;
	const conductaMap = await obtenerConducta(roster.map((u) => u.id));
	return {
		sesion,
		stats,
		analisis,
		conducta: roster.map((u) => ({
			id: u.id,
			nombre: u.fullname,
			...conductaMap.get(u.id)
		})).filter((c) => c.observacionesCount > 0 || c.faltas > 0 || c.amonestaciones > 0),
		sintonia
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 15;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BC5APBL_.js')).default;
const server_id = "src/routes/agrupamientos/[id]/estadisticas/+page.server.ts";
const imports = ["_app/immutable/nodes/15.B7k708Jr.js","_app/immutable/chunks/BYJUstCy.js","_app/immutable/chunks/BD-4OuCl.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=15-JDAAhj5o.js.map
