import { a as listarAlumnosDeCurso } from './cursos2-CPrTViO2.js';
import { o as obtenerSesion, d as listarVotos } from './agrupamientos-8gsrQUb1.js';
import { redirect, error } from '@sveltejs/kit';
import './client-BaYilI3k.js';
import './shared-server-asDUS7ug.js';
import './db-Baevsgh0.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/lib/server/agrupamientos/stats.ts
function media(nums) {
	if (nums.length === 0) return 0;
	return nums.reduce((a, b) => a + b, 0) / nums.length;
}
function mediana(nums) {
	if (nums.length === 0) return 0;
	const s = [...nums].sort((a, b) => a - b);
	const mid = Math.floor(s.length / 2);
	return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}
/** Desviación estándar muestral (igual que statistics.stdev de Python). */
function desviacion(nums) {
	if (nums.length < 2) return 0;
	const m = media(nums);
	const varianza = nums.reduce((a, b) => a + (b - m) ** 2, 0) / (nums.length - 1);
	return Math.sqrt(varianza);
}
function redondear(n, decimales = 2) {
	const f = 10 ** decimales;
	return Math.round(n * f) / f;
}
//#endregion
//#region src/lib/server/agrupamientos/emparejar.ts
/**
* Forma grupos priorizando afinidades altas y evitando bloqueos.
* Estrategia greedy en 3 fases: parejas fuertes → expansión → restantes.
*/
function generarEmparejamientos(votos, opciones = {}) {
	const tamanoMax = opciones.tamanoMax ?? 4;
	const umbralPareja = opciones.umbralPareja ?? 3.5;
	const umbralGrupo = opciones.umbralGrupo ?? 3;
	if (votos.length === 0) return [];
	const porVotante = /* @__PURE__ */ new Map();
	const nombrePorId = /* @__PURE__ */ new Map();
	for (const v of votos) {
		porVotante.set(v.votanteMoodleId, v);
		nombrePorId.set(v.votanteMoodleId, v.votanteNombre);
		for (const c of v.calificaciones) nombrePorId.set(c.id, c.nombre);
	}
	const rating = (a, b) => {
		const v = porVotante.get(a);
		if (!v) return null;
		const c = v.calificaciones.find((x) => x.id === b);
		return c ? c.puntaje : null;
	};
	const claveBloqueo = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;
	const bloqueos = /* @__PURE__ */ new Set();
	for (const v of votos) if (v.bloqueadoMoodleId != null) bloqueos.add(claveBloqueo(v.votanteMoodleId, v.bloqueadoMoodleId));
	const estaBloqueado = (a, b) => bloqueos.has(claveBloqueo(a, b));
	const afinidades = [];
	const paresVistos = /* @__PURE__ */ new Set();
	for (const v of votos) {
		const a = v.votanteMoodleId;
		for (const c of v.calificaciones) {
			const b = c.id;
			if (!porVotante.has(b)) continue;
			const clave = claveBloqueo(a, b);
			if (paresVistos.has(clave)) continue;
			const r1 = rating(a, b);
			const r2 = rating(b, a);
			if (r1 == null || r2 == null) continue;
			paresVistos.add(clave);
			afinidades.push({
				a,
				b,
				promedio: (r1 + r2) / 2,
				diferencia: Math.abs(r1 - r2)
			});
		}
	}
	const ordenadas = afinidades.filter((af) => !estaBloqueado(af.a, af.b)).sort((x, y) => y.promedio - x.promedio || x.diferencia - y.diferencia);
	const grupos = [];
	const asignados = /* @__PURE__ */ new Set();
	for (const af of ordenadas) {
		if (asignados.has(af.a) || asignados.has(af.b)) continue;
		if (af.promedio >= umbralPareja) {
			grupos.push([af.a, af.b]);
			asignados.add(af.a);
			asignados.add(af.b);
		}
	}
	for (const v of votos) {
		const x = v.votanteMoodleId;
		if (asignados.has(x)) continue;
		let mejorIdx = -1;
		let mejorPunt = 0;
		grupos.forEach((g, i) => {
			if (g.length >= tamanoMax) return;
			if (g.some((m) => estaBloqueado(x, m))) return;
			const puntos = [];
			for (const m of g) {
				const r = rating(x, m);
				if (r != null) puntos.push(r);
			}
			if (puntos.length === 0) return;
			const prom = media(puntos);
			if (prom > mejorPunt && prom >= umbralGrupo) {
				mejorPunt = prom;
				mejorIdx = i;
			}
		});
		if (mejorIdx >= 0) {
			grupos[mejorIdx].push(x);
			asignados.add(x);
		}
	}
	const sueltos = votos.map((v) => v.votanteMoodleId).filter((id) => !asignados.has(id));
	while (sueltos.length > 1) {
		const a = sueltos.shift();
		let mejorJ = -1;
		let mejorAf = -1;
		for (let j = 0; j < sueltos.length; j++) {
			const b = sueltos[j];
			if (estaBloqueado(a, b)) continue;
			const af = ((rating(a, b) ?? 0) + (rating(b, a) ?? 0)) / 2;
			if (af > mejorAf) {
				mejorAf = af;
				mejorJ = j;
			}
		}
		if (mejorJ >= 0) {
			const b = sueltos.splice(mejorJ, 1)[0];
			grupos.push([a, b]);
			asignados.add(a);
			asignados.add(b);
		} else {
			grupos.push([a]);
			asignados.add(a);
		}
	}
	if (sueltos.length === 1) grupos.push([sueltos[0]]);
	return grupos.map((g) => {
		const internos = [];
		for (const m1 of g) for (const m2 of g) {
			if (m1 === m2) continue;
			const r = rating(m1, m2);
			if (r != null) internos.push(r);
		}
		return {
			miembros: g.map((id) => ({
				id,
				nombre: nombrePorId.get(id) ?? `#${id}`
			})),
			afinidadPromedio: redondear(media(internos))
		};
	});
}
//#endregion
//#region src/lib/server/agrupamientos/analizar.ts
var UMBRAL_AFINIDAD = 4;
function analizarRelacionesSociales(votos) {
	if (votos.length === 0) return null;
	const nombrePorId = /* @__PURE__ */ new Map();
	for (const v of votos) {
		nombrePorId.set(v.votanteMoodleId, v.votanteNombre);
		for (const c of v.calificaciones) nombrePorId.set(c.id, c.nombre);
	}
	const ref = (id) => ({
		id,
		nombre: nombrePorId.get(id) ?? `#${id}`
	});
	const rating = (a, b) => {
		const v = votos.find((x) => x.votanteMoodleId === a);
		if (!v) return null;
		const c = v.calificaciones.find((x) => x.id === b);
		return c ? c.puntaje : null;
	};
	const recibidos = /* @__PURE__ */ new Map();
	for (const v of votos) for (const c of v.calificaciones) {
		if (!recibidos.has(c.id)) recibidos.set(c.id, []);
		recibidos.get(c.id).push(c.puntaje);
	}
	const popularidad = [];
	for (const [id, puntajes] of recibidos) popularidad.push({
		id,
		nombre: nombrePorId.get(id) ?? `#${id}`,
		promedio: redondear(media(puntajes)),
		mediana: mediana(puntajes),
		totalVotos: puntajes.length,
		max: Math.max(...puntajes),
		min: Math.min(...puntajes),
		desviacion: redondear(desviacion(puntajes))
	});
	popularidad.sort((a, b) => b.promedio - a.promedio);
	const reciprocas = [];
	let noReciprocas = 0;
	const paresVistos = /* @__PURE__ */ new Set();
	for (const v of votos) {
		const a = v.votanteMoodleId;
		for (const c of v.calificaciones) {
			const b = c.id;
			const rBA = rating(b, a);
			if (rBA == null) continue;
			const clave = `${Math.min(a, b)}-${Math.max(a, b)}`;
			if (paresVistos.has(clave)) continue;
			paresVistos.add(clave);
			const diferencia = Math.abs(c.puntaje - rBA);
			if (diferencia <= 1) reciprocas.push({
				a: ref(a),
				b: ref(b),
				puntajeAB: c.puntaje,
				puntajeBA: rBA,
				diferencia
			});
			else noReciprocas++;
		}
	}
	const totalRel = reciprocas.length + noReciprocas;
	const porcentajeReciprocidad = totalRel > 0 ? redondear(reciprocas.length / totalRel * 100) : 0;
	const afinidades = /* @__PURE__ */ new Map();
	for (const v of votos) {
		const set = /* @__PURE__ */ new Set();
		for (const c of v.calificaciones) if (c.puntaje >= UMBRAL_AFINIDAD) set.add(c.id);
		afinidades.set(v.votanteMoodleId, set);
	}
	const clusters = [];
	const procesados = /* @__PURE__ */ new Set();
	for (const [alumno, amigos] of afinidades) {
		if (procesados.has(alumno)) continue;
		const grupo = new Set([alumno]);
		for (const amigo of amigos) {
			const amigosDelAmigo = afinidades.get(amigo);
			if (amigosDelAmigo && amigosDelAmigo.has(alumno)) grupo.add(amigo);
		}
		if (grupo.size >= 2) {
			const internos = [];
			for (const m1 of grupo) for (const m2 of grupo) {
				if (m1 === m2) continue;
				const r = rating(m1, m2);
				if (r != null) internos.push(r);
			}
			clusters.push({
				miembros: [...grupo].map(ref),
				cohesion: redondear(media(internos))
			});
			for (const m of grupo) procesados.add(m);
		}
	}
	clusters.sort((a, b) => b.cohesion - a.cohesion);
	const riesgo = [];
	const promedios = popularidad.map((m) => m.promedio);
	const promGeneral = media(promedios);
	const desvGeneral = desviacion(promedios);
	const bloqueosRecibidos = (id) => votos.filter((v) => v.bloqueadoMoodleId === id).length;
	for (const m of popularidad) {
		const factores = [];
		let nivel = 0;
		if (m.promedio < promGeneral - desvGeneral) {
			factores.push("Promedio de calificaciones bajo");
			nivel += 2;
		}
		if (votos.filter((v) => {
			const c = v.calificaciones.find((x) => x.id === m.id);
			return c != null && c.puntaje <= 2;
		}).length > votos.length * .3) {
			factores.push("Recibe muchas calificaciones bajas");
			nivel += 2;
		}
		if (m.desviacion > 1.5) {
			factores.push("Alta variabilidad en las calificaciones recibidas");
			nivel += 1;
		}
		if (m.totalVotos < votos.length * .7) {
			factores.push("Pocos compañeros lo califican");
			nivel += 1;
		}
		const bloq = bloqueosRecibidos(m.id);
		if (bloq > 0) {
			factores.push(`Fue bloqueado por ${bloq} compañero(s)`);
			nivel += bloq >= 2 ? 2 : 1;
		}
		if (factores.length > 0) riesgo.push({
			id: m.id,
			nombre: m.nombre,
			nivelRiesgo: Math.min(nivel, 5),
			factores
		});
	}
	riesgo.sort((a, b) => b.nivelRiesgo - a.nivelRiesgo);
	const lideres = [];
	for (const m of popularidad) {
		let puntaje = 0;
		const cualidades = [];
		if (m.promedio >= 4) {
			puntaje += 3;
			cualidades.push("Alta popularidad general");
		}
		if (m.desviacion <= 1 && m.totalVotos > 1) {
			puntaje += 2;
			cualidades.push("Evaluación consistente");
		}
		if (m.totalVotos >= votos.length * .8) {
			puntaje += 2;
			cualidades.push("Amplio reconocimiento");
		}
		if (votos.filter((v) => {
			const c = v.calificaciones.find((x) => x.id === m.id);
			return c != null && c.puntaje >= 4;
		}).length >= votos.length * .4) {
			puntaje += 2;
			cualidades.push("Recibe muchas calificaciones altas");
		}
		if (puntaje >= 4) lideres.push({
			id: m.id,
			nombre: m.nombre,
			puntajeLiderazgo: puntaje,
			cualidades
		});
	}
	lideres.sort((a, b) => b.puntajeLiderazgo - a.puntajeLiderazgo);
	const recomendaciones = [];
	const altoRiesgo = riesgo.filter((r) => r.nivelRiesgo >= 3);
	if (altoRiesgo.length > 0) recomendaciones.push(`PRIORIDAD ALTA: ${altoRiesgo.length} alumno(s) con riesgo de aislamiento social. Considerar seguimiento individual y actividades de integración.`);
	const gruposGrandes = clusters.filter((c) => c.miembros.length >= 4);
	if (gruposGrandes.length > 0) recomendaciones.push(`Se detectaron ${gruposGrandes.length} grupo(s) muy cohesionado(s). Considerar mezclarlos para promover la integración del curso.`);
	const enClusters = clusters.reduce((acc, c) => acc + c.miembros.length, 0);
	if (popularidad.length > 0 && enClusters < popularidad.length * .7) recomendaciones.push("Muchos alumnos no pertenecen a un grupo definido. Considerar actividades de integración grupal.");
	if (recomendaciones.length === 0) recomendaciones.push("El grupo presenta una dinámica social equilibrada, sin alertas significativas.");
	return {
		totalParticipantes: votos.length,
		popularidad,
		reciprocas,
		noReciprocas,
		porcentajeReciprocidad,
		clusters,
		riesgo,
		lideres,
		recomendaciones,
		nivelAlerta: altoRiesgo.length > 3 ? "ALTO" : "NORMAL"
	};
}
//#endregion
//#region src/lib/server/agrupamientos/gruposTrabajo.ts
/**
* Distribuye el roster en grupos heterogéneos. Usa la popularidad recibida
* (promedio de calificaciones) para clasificar y repartir en "serpiente",
* de modo que cada grupo mezcle alumnos de distinta popularidad. Respeta
* bloqueos en lo posible.
*/
function generarGruposEquilibrados(votos, roster, opciones = {}) {
	const tamano = opciones.tamano ?? 4;
	if (roster.length < 2) return [];
	const recibidos = /* @__PURE__ */ new Map();
	for (const v of votos) for (const c of v.calificaciones) {
		if (!recibidos.has(c.id)) recibidos.set(c.id, []);
		recibidos.get(c.id).push(c.puntaje);
	}
	const popularidad = (id) => {
		const p = recibidos.get(id);
		return p && p.length > 0 ? media(p) : 3;
	};
	const clave = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;
	const bloqueos = /* @__PURE__ */ new Set();
	for (const v of votos) if (v.bloqueadoMoodleId != null) bloqueos.add(clave(v.votanteMoodleId, v.bloqueadoMoodleId));
	const bloqueado = (a, b) => bloqueos.has(clave(a, b));
	const ordenados = [...roster].sort((a, b) => popularidad(b.id) - popularidad(a.id));
	const tercio = Math.floor(ordenados.length / 3) || 1;
	const nivelPorId = /* @__PURE__ */ new Map();
	ordenados.forEach((a, i) => {
		nivelPorId.set(a.id, i < tercio ? "alto" : i < tercio * 2 ? "medio" : "bajo");
	});
	const numGrupos = Math.max(1, Math.ceil(ordenados.length / tamano));
	const grupos = Array.from({ length: numGrupos }, () => []);
	let g = 0;
	let dir = 1;
	const avanzar = () => {
		g += dir;
		if (g >= numGrupos) {
			g = numGrupos - 1;
			dir = -1;
		} else if (g < 0) {
			g = 0;
			dir = 1;
		}
	};
	for (const al of ordenados) {
		let intentos = 0;
		while (intentos < numGrupos && (grupos[g].length >= tamano || grupos[g].some((m) => bloqueado(m.id, al.id)))) {
			avanzar();
			intentos++;
		}
		if (grupos[g].length >= tamano) g = grupos.reduce((min, gr, i) => gr.length < grupos[min].length ? i : min, 0);
		grupos[g].push(al);
		avanzar();
	}
	return grupos.filter((gr) => gr.length > 0).map((gr) => ({
		miembros: gr.map((m) => ({
			...m,
			nivel: nivelPorId.get(m.id) ?? "medio"
		})),
		popularidadPromedio: redondear(media(gr.map((m) => popularidad(m.id))))
	}));
}
//#endregion
//#region src/routes/institucional/agrupamientos/[id]/resultados/+page.server.ts
var load = async ({ locals, params }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const id = parseInt(params.id, 10);
	if (isNaN(id)) error(400, "ID inválido");
	const sesion = await obtenerSesion(id);
	if (!sesion) error(404, "Sesión no encontrada");
	const votos = await listarVotos(id);
	const roster = await listarAlumnosDeCurso(sesion.cursoMoodleId).then((us) => us.map((u) => ({
		id: u.id,
		nombre: u.fullname
	}))).catch(() => []);
	const emparejamientos = generarEmparejamientos(votos);
	const analisis = analizarRelacionesSociales(votos);
	const gruposEquilibrados = generarGruposEquilibrados(votos, roster);
	return {
		sesion,
		totalVotos: votos.length,
		emparejamientos,
		analisis,
		gruposEquilibrados
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 15;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DqE3VQBn.js')).default;
const server_id = "src/routes/institucional/agrupamientos/[id]/resultados/+page.server.ts";
const imports = ["_app/immutable/nodes/15.rDY6yeqB.js","_app/immutable/chunks/DgMr71MY.js","_app/immutable/chunks/Dr15X4ZF.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=15-g5DEEex6.js.map
