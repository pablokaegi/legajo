import { a as listarAlumnosDeCurso } from './cursos2-CsA1lmu1.js';
import { o as obtenerSesion, h as listarVotos } from './agrupamientos-wzgL9O5g.js';
import { o as obtenerConducta, r as redondear, d as desviacion, m as media, a as mediana } from './perfilAlumnos-CvOsa9V8.js';
import { redirect, error } from '@sveltejs/kit';
import './client-Caj_4xk9.js';
import './shared-server-asDUS7ug.js';
import './db-BwwlYHWL.js';
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
	const promedios = popularidad.map((m) => m.promedio);
	const promGeneral = media(promedios);
	const desvGeneral = desviacion(promedios);
	const bloqueosRecibidos = (id) => votos.filter((v) => v.bloqueadoMoodleId === id).length;
	const paraAcompanar = [];
	for (const m of popularidad) {
		const observaciones = [];
		const sugerencias = [];
		let prioridad = 0;
		let pocoElegido = false;
		let bloqueado = false;
		let disparidad = false;
		if (m.promedio < promGeneral - desvGeneral) {
			observaciones.push("Recibió valoraciones de afinidad por debajo del promedio del curso.");
			prioridad += 2;
			pocoElegido = true;
		}
		if (votos.filter((v) => {
			const c = v.calificaciones.find((x) => x.id === m.id);
			return c != null && c.puntaje <= 2;
		}).length > votos.length * .3) {
			observaciones.push("Varios compañeros lo eligieron poco en esta votación.");
			prioridad += 2;
			pocoElegido = true;
		}
		if (m.desviacion > 1.5) {
			observaciones.push("Las valoraciones que recibió son dispares: algunos lo eligen mucho y otros poco.");
			prioridad += 1;
			disparidad = true;
		}
		if (m.totalVotos < votos.length * .5) {
			observaciones.push("Pocos compañeros lo incluyeron entre los que evaluaron.");
			prioridad += 1;
		}
		const bloq = bloqueosRecibidos(m.id);
		if (bloq > 0) {
			observaciones.push(`Algún compañero pidió no quedar en el mismo grupo (${bloq}).`);
			prioridad += bloq >= 2 ? 2 : 1;
			bloqueado = true;
		}
		if (observaciones.length > 0) {
			sugerencias.push("Asignarle un rol con valor y responsabilidad dentro del grupo (vocero, coordinador de materiales, relator).");
			if (disparidad) sugerencias.push("Apoyarse en los compañeros que sí lo valoran para armar su grupo.");
			else sugerencias.push("Emparejarlo con compañeros receptivos y con buena disposición.");
			if (bloqueado) sugerencias.push("Evitar ubicarlo con quienes marcaron incompatibilidad; trabajar ese vínculo aparte.");
			if (pocoElegido) sugerencias.push("Hacer visible alguna fortaleza suya frente al grupo para elevar su reconocimiento.");
			paraAcompanar.push({
				id: m.id,
				nombre: m.nombre,
				prioridad: Math.min(prioridad, 5),
				observaciones,
				sugerencias
			});
		}
	}
	paraAcompanar.sort((a, b) => b.prioridad - a.prioridad);
	const referentes = [];
	for (const m of popularidad) {
		let puntaje = 0;
		const cualidades = [];
		if (m.promedio >= 4) {
			puntaje += 3;
			cualidades.push("Muy bien valorado por el grupo");
		}
		if (m.desviacion <= 1 && m.totalVotos > 1) {
			puntaje += 2;
			cualidades.push("Valoración pareja entre sus compañeros");
		}
		if (m.totalVotos >= votos.length * .8) {
			puntaje += 2;
			cualidades.push("Reconocido por casi todo el curso");
		}
		if (votos.filter((v) => {
			const c = v.calificaciones.find((x) => x.id === m.id);
			return c != null && c.puntaje >= 4;
		}).length >= votos.length * .4) {
			puntaje += 2;
			cualidades.push("Muchos compañeros lo eligen con puntaje alto");
		}
		if (puntaje >= 4) referentes.push({
			id: m.id,
			nombre: m.nombre,
			puntaje,
			cualidades
		});
	}
	referentes.sort((a, b) => b.puntaje - a.puntaje);
	const recomendaciones = [];
	recomendaciones.push({
		texto: "Conformar grupos heterogéneos y mixtos en lugar de homogéneos: distintos niveles, géneros y vínculos en cada grupo mejoran el rendimiento de todos y la cohesión del curso.",
		fundamento: "Aprendizaje cooperativo — Johnson & Johnson; Slavin (método STAD)."
	});
	recomendaciones.push({
		texto: "Rotar la conformación de los grupos cada cierto tiempo. El sociograma es una foto del momento, no una etiqueta fija: repetir la votación periódicamente permite ver la evolución.",
		fundamento: "Sociometría — Jacob Moreno."
	});
	if (paraAcompanar.length > 0) recomendaciones.push({
		texto: "Para los alumnos menos elegidos, asignarles roles con estatus y competencias visibles dentro del grupo, y destacar públicamente algo que hacen bien. Subir su reconocimiento cambia cómo los ven sus compañeros.",
		fundamento: "Instrucción Compleja — Elizabeth Cohen, \"Designing Groupwork\" (tratamiento del estatus)."
	});
	if (referentes.length > 0) recomendaciones.push({
		texto: "Aprovechar a los alumnos con buen reconocimiento como apoyos: distribuirlos en distintos grupos y proponerles acompañar a compañeros, sin sobrecargarlos.",
		fundamento: "Tutoría entre pares (peer tutoring)."
	});
	const clustersGrandes = clusters.filter((c) => c.miembros.length >= 4);
	if (clustersGrandes.length > 0) recomendaciones.push({
		texto: `Se detectaron ${clustersGrandes.length} grupo(s) muy cerrado(s). Intercalar a sus integrantes con otros compañeros en algunas actividades favorece la integración del curso.`,
		fundamento: "Hipótesis del contacto intergrupal — Gordon Allport."
	});
	recomendaciones.push({
		texto: "Comunicar a los alumnos que la votación sirve para armar mejores equipos de trabajo, no para rankear a nadie. Mantener los resultados en reserva y usarlos con cuidado.",
		fundamento: "Uso ético de la sociometría en el aula."
	});
	const alta = paraAcompanar.filter((a) => a.prioridad >= 3).length;
	return {
		totalParticipantes: votos.length,
		popularidad,
		reciprocas,
		noReciprocas,
		porcentajeReciprocidad,
		clusters,
		paraAcompanar,
		referentes,
		recomendaciones,
		climaGrupal: alta > 3 ? "requiere_atencion" : "equilibrado"
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
	const stats = calcularEstadisticas(votos, roster.length);
	const analisis = analizarRelacionesSociales(votos);
	const conductaMap = await obtenerConducta(roster.map((u) => u.id));
	return {
		sesion,
		stats,
		analisis,
		conducta: roster.map((u) => ({
			id: u.id,
			nombre: u.fullname,
			...conductaMap.get(u.id)
		})).filter((c) => c.observacionesCount > 0 || c.faltas > 0 || c.amonestaciones > 0)
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 15;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-4xEfYLS8.js')).default;
const server_id = "src/routes/institucional/agrupamientos/[id]/estadisticas/+page.server.ts";
const imports = ["_app/immutable/nodes/15.CACeWSL0.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/BEDIq91W.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=15-Qr3qdiVr.js.map
