import { d as db, g as agrupamientoSesiones, h as agrupamientoVotos, j as agrupamientoGrupos } from './db-BwfbdrtT.js';
import { desc, eq, and } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

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
//#region src/lib/server/services/agrupamientos.ts
async function listarSesiones(filtros = {}) {
	let q = db.select().from(agrupamientoSesiones).orderBy(desc(agrupamientoSesiones.fecha), desc(agrupamientoSesiones.createdAt));
	if (filtros.estado) q = q.where(eq(agrupamientoSesiones.estado, filtros.estado));
	const sesiones = await q;
	const result = [];
	for (const s of sesiones) {
		const votos = await db.select({ id: agrupamientoVotos.id }).from(agrupamientoVotos).where(eq(agrupamientoVotos.sesionId, s.id));
		result.push({
			...s,
			cantidadVotos: votos.length
		});
	}
	return result;
}
async function obtenerSesion(id) {
	const [row] = await db.select().from(agrupamientoSesiones).where(eq(agrupamientoSesiones.id, id)).limit(1);
	return row ?? null;
}
async function obtenerSesionPorToken(token) {
	const [row] = await db.select().from(agrupamientoSesiones).where(eq(agrupamientoSesiones.votoToken, token)).limit(1);
	return row ?? null;
}
async function crearSesion(createdBy, data) {
	const [result] = await db.insert(agrupamientoSesiones).values({
		cursoMoodleId: data.cursoMoodleId,
		cursoNombre: data.cursoNombre,
		titulo: data.titulo,
		fecha: data.fecha,
		estado: "abierta",
		cantidadEvaluar: data.cantidadEvaluar ?? 5,
		notas: data.notas ?? null,
		createdBy
	});
	return result.insertId;
}
async function editarSesion(id, data) {
	await db.update(agrupamientoSesiones).set({
		...data,
		updatedAt: /* @__PURE__ */ new Date()
	}).where(eq(agrupamientoSesiones.id, id));
}
async function eliminarSesion(id) {
	await db.delete(agrupamientoSesiones).where(eq(agrupamientoSesiones.id, id));
}
/** Genera (o regenera) el token público para votar desde el celular. */
async function generarTokenVoto(id) {
	const token = randomUUID();
	await editarSesion(id, { votoToken: token });
	return token;
}
async function quitarTokenVoto(id) {
	await editarSesion(id, { votoToken: null });
}
function parseCalificaciones(raw) {
	try {
		const arr = JSON.parse(raw);
		if (!Array.isArray(arr)) return [];
		return arr.map((c) => ({
			id: Number(c.id),
			nombre: String(c.nombre ?? ""),
			puntaje: Number(c.puntaje)
		})).filter((c) => c.id > 0 && c.puntaje >= 1 && c.puntaje <= 5);
	} catch {
		return [];
	}
}
async function listarVotos(sesionId) {
	return (await db.select().from(agrupamientoVotos).where(eq(agrupamientoVotos.sesionId, sesionId)).orderBy(agrupamientoVotos.votanteNombre)).map((r) => ({
		id: r.id,
		votanteMoodleId: r.votanteMoodleId,
		votanteNombre: r.votanteNombre,
		calificaciones: parseCalificaciones(r.calificaciones),
		bloqueadoMoodleId: r.bloqueadoMoodleId,
		bloqueadoNombre: r.bloqueadoNombre
	}));
}
/** Devuelve el id del votante de cada voto ya emitido en la sesión. */
async function idsQueVotaron(sesionId) {
	const rows = await db.select({ votanteMoodleId: agrupamientoVotos.votanteMoodleId }).from(agrupamientoVotos).where(eq(agrupamientoVotos.sesionId, sesionId));
	return new Set(rows.map((r) => r.votanteMoodleId));
}
/** Registra un voto nuevo. Lanza 'ya_voto' si el alumno ya votó. */
async function registrarVoto(sesionId, voto) {
	const [existente] = await db.select({ id: agrupamientoVotos.id }).from(agrupamientoVotos).where(and(eq(agrupamientoVotos.sesionId, sesionId), eq(agrupamientoVotos.votanteMoodleId, voto.votanteMoodleId))).limit(1);
	if (existente) throw new Error("ya_voto");
	await db.insert(agrupamientoVotos).values({
		sesionId,
		votanteMoodleId: voto.votanteMoodleId,
		votanteNombre: voto.votanteNombre,
		calificaciones: JSON.stringify(voto.calificaciones),
		bloqueadoMoodleId: voto.bloqueadoMoodleId ?? null,
		bloqueadoNombre: voto.bloqueadoNombre ?? null
	});
}
async function eliminarVoto(votoId) {
	await db.delete(agrupamientoVotos).where(eq(agrupamientoVotos.id, votoId));
}
/**
* Procesa y guarda un voto desde el FormData del kiosko. Lógica compartida
* entre la votación interna y el link público con token.
*/
async function procesarVotoDesdeForm(sesionId, fd) {
	const votanteMoodleId = parseInt(String(fd.get("votanteMoodleId") ?? ""), 10);
	const votanteNombre = String(fd.get("votanteNombre") ?? "").trim();
	if (!votanteMoodleId || !votanteNombre) return { error: "Alumno inválido." };
	let calificaciones = [];
	try {
		const arr = JSON.parse(String(fd.get("calificaciones") ?? "[]"));
		if (Array.isArray(arr)) calificaciones = arr.map((c) => ({
			id: Number(c.id),
			nombre: String(c.nombre ?? ""),
			puntaje: Number(c.puntaje)
		})).filter((c) => c.id > 0 && c.puntaje >= 1 && c.puntaje <= 5);
	} catch {
		return { error: "Datos de votación inválidos." };
	}
	if (calificaciones.length === 0) return { error: "Tenés que calificar a tus compañeros." };
	if (calificaciones.every((c) => c.puntaje === 1)) return { error: "No podés calificar a todos con la puntuación mínima." };
	const bloqRaw = String(fd.get("bloqueadoMoodleId") ?? "");
	const bloqueadoMoodleId = bloqRaw ? parseInt(bloqRaw, 10) : null;
	const valido = bloqueadoMoodleId != null && bloqueadoMoodleId > 0;
	const bloqueadoNombre = String(fd.get("bloqueadoNombre") ?? "").trim() || null;
	try {
		await registrarVoto(sesionId, {
			votanteMoodleId,
			votanteNombre,
			calificaciones,
			bloqueadoMoodleId: valido ? bloqueadoMoodleId : null,
			bloqueadoNombre: valido ? bloqueadoNombre : null
		});
	} catch (e) {
		if (e instanceof Error && e.message === "ya_voto") return { error: "Ese alumno ya emitió su votación." };
		return { error: "No se pudo guardar el voto. Intentá de nuevo." };
	}
	return { ok: true };
}
async function eliminarTodosLosVotos(sesionId) {
	await db.delete(agrupamientoVotos).where(eq(agrupamientoVotos.sesionId, sesionId));
}
function prng(seed) {
	let t = seed >>> 0;
	return () => {
		t = t + 1831565813 | 0;
		let r = Math.imul(t ^ t >>> 15, 1 | t);
		r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r;
		return ((r ^ r >>> 14) >>> 0) / 4294967296;
	};
}
function shuffleSeeded(arr, seed) {
	const a = [...arr];
	const rand = prng(seed);
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
/**
* Selecciona de forma determinística los `cantidad` compañeros que un alumno
* debe evaluar. Determinística: si el alumno recarga la página obtiene los
* mismos compañeros.
*/
function asignarCompaneros(sesionId, votanteId, roster, cantidad) {
	const otros = roster.filter((a) => a.id !== votanteId);
	return shuffleSeeded(otros, sesionId * 1e5 + votanteId).slice(0, Math.min(cantidad, otros.length));
}
/** Genera votos aleatorios realistas para los alumnos que aún no votaron. */
async function generarVotosAleatorios(sesionId, roster, cantidad) {
	const yaVotaron = await idsQueVotaron(sesionId);
	let generados = 0;
	for (const alumno of roster) {
		if (yaVotaron.has(alumno.id)) continue;
		const companeros = asignarCompaneros(sesionId, alumno.id, roster, cantidad);
		if (companeros.length === 0) continue;
		const pesos = [
			10,
			20,
			40,
			25,
			5
		];
		const calificaciones = companeros.map((c) => {
			const total = pesos.reduce((a, b) => a + b, 0);
			let r = Math.random() * total;
			let puntaje = 5;
			for (let p = 0; p < 5; p++) {
				if (r < pesos[p]) {
					puntaje = p + 1;
					break;
				}
				r -= pesos[p];
			}
			return {
				id: c.id,
				nombre: c.nombre,
				puntaje
			};
		});
		const bloqueado = Math.random() < .2 ? companeros[Math.floor(Math.random() * companeros.length)] : null;
		try {
			await registrarVoto(sesionId, {
				votanteMoodleId: alumno.id,
				votanteNombre: alumno.nombre,
				calificaciones,
				bloqueadoMoodleId: bloqueado?.id ?? null,
				bloqueadoNombre: bloqueado?.nombre ?? null
			});
			generados++;
		} catch {}
	}
	return generados;
}
async function listarGrupos(sesionId) {
	return (await db.select().from(agrupamientoGrupos).where(eq(agrupamientoGrupos.sesionId, sesionId)).orderBy(desc(agrupamientoGrupos.createdAt))).map((r) => ({
		...r,
		grupos: JSON.parse(r.gruposJson)
	}));
}
async function guardarGrupos(sesionId, nombre, modo, grupos) {
	const [result] = await db.insert(agrupamientoGrupos).values({
		sesionId,
		nombre,
		modo,
		gruposJson: JSON.stringify(grupos)
	});
	return result.insertId;
}
async function eliminarGrupos(id) {
	await db.delete(agrupamientoGrupos).where(eq(agrupamientoGrupos.id, id));
}
/**
* Devuelve, para un alumno, el historial de agrupaciones guardadas en las que
* participó: con qué compañeros quedó y la lectura pedagógica del sociograma
* de esa sesión (si estaba bien valorado o si conviene acompañarlo).
*/
async function obtenerHistorialAgrupamientosDeAlumno(alumnoMoodleId) {
	const rows = await db.select({
		grupo: agrupamientoGrupos,
		sesion: agrupamientoSesiones
	}).from(agrupamientoGrupos).innerJoin(agrupamientoSesiones, eq(agrupamientoGrupos.sesionId, agrupamientoSesiones.id)).orderBy(desc(agrupamientoGrupos.createdAt));
	const entradas = [];
	const analisisCache = /* @__PURE__ */ new Map();
	for (const row of rows) {
		let grupos;
		try {
			grupos = JSON.parse(row.grupo.gruposJson);
		} catch {
			continue;
		}
		if (!Array.isArray(grupos)) continue;
		const miGrupo = grupos.find((g) => g.some((m) => Number(m.id) === alumnoMoodleId));
		if (!miGrupo) continue;
		const companeros = miGrupo.filter((m) => Number(m.id) !== alumnoMoodleId).map((m) => ({
			id: Number(m.id),
			nombre: String(m.nombre ?? "")
		}));
		if (!analisisCache.has(row.sesion.id)) {
			const votos = await listarVotos(row.sesion.id);
			analisisCache.set(row.sesion.id, analizarRelacionesSociales(votos));
		}
		const analisis = analisisCache.get(row.sesion.id);
		let notaPedagogica = { tipo: null };
		if (analisis) {
			const acomp = analisis.paraAcompanar.find((a) => a.id === alumnoMoodleId);
			const refe = analisis.referentes.find((r) => r.id === alumnoMoodleId);
			if (acomp) notaPedagogica = {
				tipo: "acompanar",
				observaciones: acomp.observaciones,
				sugerencias: acomp.sugerencias
			};
			else if (refe) notaPedagogica = {
				tipo: "referente",
				cualidades: refe.cualidades
			};
		}
		entradas.push({
			sesionId: row.sesion.id,
			sesionTitulo: row.sesion.titulo,
			cursoNombre: row.sesion.cursoNombre,
			fecha: row.sesion.fecha,
			modo: row.grupo.modo,
			nombreAgrupacion: row.grupo.nombre,
			companeros,
			notaPedagogica
		});
	}
	return entradas;
}

export { eliminarTodosLosVotos as a, eliminarVoto as b, crearSesion as c, generarTokenVoto as d, eliminarSesion as e, editarSesion as f, generarVotosAleatorios as g, listarVotos as h, analizarRelacionesSociales as i, desviacion as j, eliminarGrupos as k, listarSesiones as l, media as m, guardarGrupos as n, obtenerSesion as o, listarGrupos as p, quitarTokenVoto as q, redondear as r, procesarVotoDesdeForm as s, idsQueVotaron as t, asignarCompaneros as u, obtenerHistorialAgrupamientosDeAlumno as v, obtenerSesionPorToken as w };
//# sourceMappingURL=agrupamientos-Bk5OlPpq.js.map
