import { a as listarAlumnosDeCurso } from './cursos2-CxacCokc.js';
import { o as obtenerSesion, h as listarVotos } from './agrupamientos-MWeOpDHT.js';
import { r as redondear, d as desviacion, m as mediana, a as media } from './stats-CbU88415.js';
import { redirect, error } from '@sveltejs/kit';
import './client-BrmXZkzW.js';
import './shared-server-asDUS7ug.js';
import './db-BEC8cTGI.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'node:crypto';

//#region src/lib/server/agrupamientos/estadisticas.ts
function calcularEstadisticas(votos, totalCurso) {
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
	let totalRatings = 0;
	let totalBloqueos = 0;
	const distribucion = {
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0
	};
	const recibidos = /* @__PURE__ */ new Map();
	const bloqueosRecibidos = /* @__PURE__ */ new Map();
	for (const v of votos) {
		totalRatings += v.calificaciones.length;
		if (v.bloqueadoMoodleId != null) {
			totalBloqueos++;
			bloqueosRecibidos.set(v.bloqueadoMoodleId, (bloqueosRecibidos.get(v.bloqueadoMoodleId) ?? 0) + 1);
		}
		for (const c of v.calificaciones) {
			distribucion[c.puntaje] = (distribucion[c.puntaje] ?? 0) + 1;
			if (!recibidos.has(c.id)) recibidos.set(c.id, []);
			recibidos.get(c.id).push(c.puntaje);
		}
	}
	const populares = [];
	for (const [id, puntajes] of recibidos) populares.push({
		id,
		nombre: nombrePorId.get(id) ?? `#${id}`,
		promedio: redondear(media(puntajes)),
		totalVotos: puntajes.length,
		suma: puntajes.reduce((a, b) => a + b, 0),
		max: Math.max(...puntajes),
		min: Math.min(...puntajes),
		desviacion: redondear(desviacion(puntajes))
	});
	populares.sort((a, b) => b.promedio - a.promedio || b.totalVotos - a.totalVotos);
	const masBloqueados = [...bloqueosRecibidos.entries()].map(([id, cantidad]) => ({
		id,
		nombre: nombrePorId.get(id) ?? `#${id}`,
		cantidad
	})).sort((a, b) => b.cantidad - a.cantidad);
	const bloqueoPorVotante = /* @__PURE__ */ new Map();
	for (const v of votos) if (v.bloqueadoMoodleId != null) bloqueoPorVotante.set(v.votanteMoodleId, v.bloqueadoMoodleId);
	const bloqueosMutuos = [];
	const vistosMutuos = /* @__PURE__ */ new Set();
	for (const [a, b] of bloqueoPorVotante) if (bloqueoPorVotante.get(b) === a) {
		const clave = `${Math.min(a, b)}-${Math.max(a, b)}`;
		if (!vistosMutuos.has(clave)) {
			vistosMutuos.add(clave);
			bloqueosMutuos.push({
				a: ref(a),
				b: ref(b)
			});
		}
	}
	const rating = (a, b) => {
		const v = votos.find((x) => x.votanteMoodleId === a);
		if (!v) return null;
		const c = v.calificaciones.find((x) => x.id === b);
		return c ? c.puntaje : null;
	};
	const afinidades = [];
	const paresVistos = /* @__PURE__ */ new Set();
	for (const v of votos) {
		const a = v.votanteMoodleId;
		for (const c of v.calificaciones) {
			const b = c.id;
			const r2 = rating(b, a);
			if (r2 == null) continue;
			const clave = `${Math.min(a, b)}-${Math.max(a, b)}`;
			if (paresVistos.has(clave)) continue;
			paresVistos.add(clave);
			afinidades.push({
				a: ref(a),
				b: ref(b),
				puntaje1: c.puntaje,
				puntaje2: r2,
				promedio: redondear((c.puntaje + r2) / 2),
				diferencia: Math.abs(c.puntaje - r2)
			});
		}
	}
	afinidades.sort((x, y) => y.promedio - x.promedio || x.diferencia - y.diferencia);
	const generosidad = [];
	for (const v of votos) if (v.calificaciones.length > 0) generosidad.push({
		id: v.votanteMoodleId,
		nombre: v.votanteNombre,
		promedio: redondear(media(v.calificaciones.map((c) => c.puntaje)))
	});
	const promGeneral = media(generosidad.map((g) => g.promedio));
	const generosos = generosidad.filter((g) => g.promedio > promGeneral + .5).sort((a, b) => b.promedio - a.promedio);
	const exigentes = generosidad.filter((g) => g.promedio < promGeneral - .5).sort((a, b) => a.promedio - b.promedio);
	return {
		totalVotantes: votos.length,
		totalRatings,
		totalBloqueos,
		participacion: totalCurso > 0 ? redondear(votos.length / totalCurso * 100, 1) : 0,
		distribucion,
		populares,
		masBloqueados,
		bloqueosMutuos,
		mejoresAfinidades: afinidades,
		generosos,
		exigentes
	};
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
//#region src/routes/institucional/agrupamientos/[id]/estadisticas/+page.server.ts
var load = async ({ locals, params }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const id = parseInt(params.id, 10);
	if (isNaN(id)) error(400, "ID inválido");
	const sesion = await obtenerSesion(id);
	if (!sesion) error(404, "Sesión no encontrada");
	const roster = await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => []);
	const votos = await listarVotos(id);
	return {
		sesion,
		stats: calcularEstadisticas(votos, roster.length),
		analisis: analizarRelacionesSociales(votos)
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 15;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BfhLpVuA.js')).default;
const server_id = "src/routes/institucional/agrupamientos/[id]/estadisticas/+page.server.ts";
const imports = ["_app/immutable/nodes/15.FUc_Z6JZ.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/BEDIq91W.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=15-4xPKeMPW.js.map
