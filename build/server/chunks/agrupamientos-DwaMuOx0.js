import { b as agrupamientoSesiones, d as db, c as agrupamientoVotos, e as agrupamientoGrupos } from './db-DnDhVbjt.js';
import { a as esDirectivoOAdmin, v as veTodasLasSesiones } from './authz-C2Zplj7X.js';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
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
var BASE_MINIMA = 3;
function analizarRelacionesSociales(g) {
	if (g.votantes.size === 0) return null;
	const nom = g.modo === "nominacion";
	const ref = (id) => ({
		id,
		nombre: g.nombre(id)
	});
	const metricas = g.alumnos.map((a) => {
		const exposicion = g.exposicion(a.id);
		const recibidas = g.recibidas(a.id);
		return {
			id: a.id,
			nombre: a.nombre,
			voto: g.votantes.has(a.id),
			recibidas,
			exposicion,
			tasa: exposicion > 0 ? redondear(recibidas / exposicion, 3) : null,
			mutuas: g.mutuasDe(a.id).length,
			rechazos: g.rechazosRecibidos(a.id)
		};
	});
	const conBase = metricas.filter((m) => m.exposicion >= BASE_MINIMA && m.tasa != null);
	const tasas = conBase.map((m) => m.tasa);
	const mediaT = media(tasas);
	const desvT = desviacion(tasas);
	let elecciones = 0;
	let devueltas = 0;
	for (const a of g.votantes) for (const b of g.eleccionesDe(a)) {
		if (!g.opino(b, a)) continue;
		elecciones++;
		if (g.elige(b, a)) devueltas++;
	}
	const porcentajeReciprocidad = elecciones > 0 ? redondear(devueltas / elecciones * 100, 0) : 0;
	const reciprocas = g.paresMutuos.map(([a, b]) => ({
		a: ref(a),
		b: ref(b)
	}));
	const vecinos = /* @__PURE__ */ new Map();
	for (const [a, b] of g.paresMutuos) {
		vecinos.set(a, [...vecinos.get(a) ?? [], b]);
		vecinos.set(b, [...vecinos.get(b) ?? [], a]);
	}
	const visto = /* @__PURE__ */ new Set();
	const clusters = [];
	for (const inicio of vecinos.keys()) {
		if (visto.has(inicio)) continue;
		const comp = [];
		const pila = [inicio];
		visto.add(inicio);
		while (pila.length) {
			const x = pila.pop();
			comp.push(x);
			for (const y of vecinos.get(x) ?? []) if (!visto.has(y)) {
				visto.add(y);
				pila.push(y);
			}
		}
		if (comp.length < 2) continue;
		const enComp = new Set(comp);
		const aristas = g.paresMutuos.filter(([a, b]) => enComp.has(a) && enComp.has(b)).length;
		const posibles = comp.length * (comp.length - 1) / 2;
		clusters.push({
			miembros: comp.map(ref).sort((x, y) => x.nombre.localeCompare(y.nombre, "es")),
			densidad: redondear(aristas / posibles * 100, 0)
		});
	}
	clusters.sort((a, b) => b.miembros.length - a.miembros.length || b.densidad - a.densidad);
	const paraAcompanar = [];
	const menosElegidos = [];
	for (const m of metricas) {
		const observaciones = [];
		const sugerencias = [];
		let prioridad = 0;
		const conDatos = m.exposicion >= BASE_MINIMA && m.tasa != null;
		let pocoElegido = false;
		if (conDatos && m.recibidas === 0) {
			observaciones.push(nom ? `Nadie lo eligió en esta votación (podían hacerlo ${m.exposicion} compañeros).` : `Ninguno de los ${m.exposicion} compañeros que lo calificaron le dio 4 o 5.`);
			prioridad += 3;
			pocoElegido = true;
		} else if (conDatos && desvT > 0 && m.tasa < mediaT - desvT) {
			observaciones.push("Recibió menos elecciones que la mayoría del curso.");
			prioridad += 2;
			pocoElegido = true;
		}
		if (nom && m.voto && m.mutuas === 0 && m.recibidas > 0) {
			observaciones.push("Ninguna de sus elecciones fue recíproca.");
			prioridad += 1;
		}
		if (m.rechazos >= 2) {
			observaciones.push(`${m.rechazos} compañeros pidieron no quedar en el mismo grupo.`);
			prioridad += 2;
		} else if (m.rechazos === 1) {
			observaciones.push("Un compañero pidió no quedar en el mismo grupo.");
			prioridad += 1;
		}
		if (pocoElegido) menosElegidos.push(m.id);
		if (prioridad < 2) continue;
		if (!m.voto) observaciones.push("No participó de la votación.");
		const eligio = g.eleccionesDe(m.id).map(g.nombre);
		if (eligio.length > 0) sugerencias.push(`Ubicarlo con al menos uno de los compañeros que eligió: ${eligio.join(", ")}.`);
		else sugerencias.push("Ubicarlo con compañeros receptivos y con buena disposición.");
		sugerencias.push("Asignarle un rol con valor y responsabilidad dentro del grupo (vocero, coordinador de materiales, relator).");
		if (pocoElegido) sugerencias.push("Hacer visible alguna fortaleza suya frente al grupo para elevar su reconocimiento.");
		if (m.rechazos > 0) sugerencias.push("Evitar ubicarlo con quienes marcaron incompatibilidad; trabajar ese vínculo aparte.");
		paraAcompanar.push({
			id: m.id,
			nombre: m.nombre,
			prioridad: Math.min(prioridad, 5),
			observaciones,
			sugerencias
		});
	}
	paraAcompanar.sort((a, b) => b.prioridad - a.prioridad || a.nombre.localeCompare(b.nombre, "es"));
	const referentes = [];
	for (const m of conBase) {
		if (m.rechazos > 0) continue;
		if (!(m.tasa >= mediaT + desvT && m.recibidas >= BASE_MINIMA)) continue;
		const cualidades = [nom ? `Lo eligieron ${m.recibidas} de ${m.exposicion} compañeros` : `${m.recibidas} de ${m.exposicion} compañeros le dieron 4 o 5`];
		if (m.mutuas >= 2) cualidades.push(`${m.mutuas} vínculos recíprocos`);
		referentes.push({
			id: m.id,
			nombre: m.nombre,
			puntaje: m.recibidas,
			cualidades
		});
	}
	referentes.sort((a, b) => b.puntaje - a.puntaje);
	const totalCurso = g.alumnos.length;
	const participacion = totalCurso > 0 ? redondear(g.votantes.size / totalCurso * 100, 0) : 0;
	const advertencias = [];
	if (!nom) advertencias.push("Sesión con el formato anterior: cada alumno calificó solo a unos pocos compañeros asignados al azar, así que casi ningún par se evaluó mutuamente. Los vínculos recíprocos y los subgrupos son poco confiables; para una lectura sólida, hacé una votación nueva con elección de compañeros.");
	if (participacion < 70) advertencias.push(`Votó el ${participacion}% del curso: la lectura es parcial (los que no votaron no pudieron elegir a nadie).`);
	const sinBase = metricas.filter((m) => m.exposicion < BASE_MINIMA).length;
	if (sinBase > 0) advertencias.push(`${sinBase} alumno(s) sin datos suficientes para sacar conclusiones (menos de ${BASE_MINIMA} compañeros podían elegirlos).`);
	const recomendaciones = [];
	const nadie = paraAcompanar.filter((p) => metricas.find((m) => m.id === p.id)?.recibidas === 0);
	if (nadie.length > 0) recomendaciones.push({
		texto: `${nadie.length} alumno(s) no recibieron elecciones. Ubicarlos con al menos uno de los compañeros que ELLOS eligieron: tener un vínculo recíproco en el aula protege frente al aislamiento aunque la aceptación general sea baja.`,
		fundamento: "Parker & Asher (1993), Developmental Psychology 29(4)."
	});
	if (paraAcompanar.length > 0) recomendaciones.push({
		texto: "Para los alumnos menos elegidos, asignarles roles con estatus y competencias visibles dentro del grupo, y destacar públicamente algo que hacen bien (asignar competencia). Subir su reconocimiento cambia cómo los ven sus compañeros.",
		fundamento: "Instrucción Compleja — Cohen & Lotan, \"Designing Groupwork\" (tratamiento del estatus)."
	});
	if (referentes.length > 0) recomendaciones.push({
		texto: "Distribuir a los alumnos más elegidos en distintos grupos y darles roles que requieran escuchar y sumar a otros (no solo liderar), sin sobrecargarlos.",
		fundamento: "Cohen & Lotan (estatus en el grupo); tutoría entre pares — Topping (2005)."
	});
	const cerrados = clusters.filter((c) => c.miembros.length >= 4 && c.densidad >= 50);
	if (cerrados.length > 0) recomendaciones.push({
		texto: `Se detectaron ${cerrados.length} subgrupo(s) muy cerrado(s). Intercalar a sus integrantes con otros compañeros en algunas actividades favorece la integración del curso.`,
		fundamento: "Hipótesis del contacto intergrupal — Gordon Allport."
	});
	recomendaciones.push({
		texto: "Rotar la conformación de los grupos y repetir la votación cada tanto: el sociograma es una foto del momento, no una etiqueta. Comparar votaciones permite ver la evolución.",
		fundamento: "Sociometría — Jacob Moreno."
	});
	recomendaciones.push({
		texto: "Comunicar a los alumnos que la votación sirve para armar mejores equipos de trabajo, no para rankear a nadie. Mantener los resultados en reserva y usarlos con cuidado.",
		fundamento: "Uso ético de la sociometría en el aula (Mayeux, Underwood & Risser, 2007)."
	});
	const alta = paraAcompanar.filter((a) => a.prioridad >= 3).length;
	return {
		modo: g.modo,
		totalParticipantes: g.votantes.size,
		totalCurso,
		participacion,
		metricas,
		reciprocas,
		porcentajeReciprocidad,
		clusters,
		paraAcompanar,
		menosElegidos,
		referentes,
		recomendaciones,
		advertencias,
		climaGrupal: alta >= Math.max(3, Math.ceil(totalCurso * .15)) ? "requiere_atencion" : "equilibrado"
	};
}
//#endregion
//#region src/lib/server/agrupamientos/grafo.ts
var clave = (a, b) => a < b ? `${a}-${b}` : `${b}-${a}`;
function construirGrafo(votos, roster, modo) {
	const nombres = /* @__PURE__ */ new Map();
	for (const v of votos) {
		nombres.set(v.votanteMoodleId, v.votanteNombre);
		for (const c of v.calificaciones) if (!nombres.has(c.id)) nombres.set(c.id, c.nombre);
	}
	for (const a of roster) nombres.set(a.id, a.nombre);
	const votantes = new Set(votos.map((v) => v.votanteMoodleId));
	const puntajes = /* @__PURE__ */ new Map();
	const orden = /* @__PURE__ */ new Map();
	for (const v of votos) {
		const m = /* @__PURE__ */ new Map();
		const o = [];
		for (const c of v.calificaciones) {
			if (c.id === v.votanteMoodleId || m.has(c.id)) continue;
			m.set(c.id, c.puntaje);
			if (modo === "nominacion" || c.puntaje >= 4) o.push(c.id);
		}
		puntajes.set(v.votanteMoodleId, m);
		orden.set(v.votanteMoodleId, o);
	}
	const elige = (a, b) => {
		const p = puntajes.get(a)?.get(b);
		if (p == null) return false;
		return modo === "nominacion" ? true : p >= 4;
	};
	const peso = (a, b) => {
		const p = puntajes.get(a)?.get(b);
		if (p == null) return 0;
		return modo === "nominacion" ? 1 : (p - 1) / 4;
	};
	const recibidasMap = /* @__PURE__ */ new Map();
	const exposicionMap = /* @__PURE__ */ new Map();
	for (const [a, m] of puntajes) for (const [b] of m) {
		if (elige(a, b)) recibidasMap.set(b, (recibidasMap.get(b) ?? 0) + 1);
		if (modo === "calificacion") exposicionMap.set(b, (exposicionMap.get(b) ?? 0) + 1);
	}
	const exposicion = (b) => modo === "nominacion" ? votantes.size - (votantes.has(b) ? 1 : 0) : exposicionMap.get(b) ?? 0;
	const paresMutuos = [];
	const mutuas = /* @__PURE__ */ new Map();
	for (const [a, o] of orden) for (const b of o) if (a < b && elige(b, a)) {
		paresMutuos.push([a, b]);
		mutuas.set(a, [...mutuas.get(a) ?? [], b]);
		mutuas.set(b, [...mutuas.get(b) ?? [], a]);
	}
	const bloqueos = /* @__PURE__ */ new Set();
	const paresBloqueados = [];
	const rechazos = /* @__PURE__ */ new Map();
	for (const v of votos) {
		const b = v.bloqueadoMoodleId;
		if (b == null || b === v.votanteMoodleId) continue;
		rechazos.set(b, (rechazos.get(b) ?? 0) + 1);
		const k = clave(v.votanteMoodleId, b);
		if (!bloqueos.has(k)) {
			bloqueos.add(k);
			paresBloqueados.push(v.votanteMoodleId < b ? [v.votanteMoodleId, b] : [b, v.votanteMoodleId]);
		}
	}
	const ids = new Set([...roster.map((a) => a.id), ...votantes]);
	if (roster.length === 0) for (const id of nombres.keys()) ids.add(id);
	return {
		modo,
		alumnos: [...ids].map((id) => ({
			id,
			nombre: nombres.get(id) ?? `#${id}`
		})).sort((x, y) => x.nombre.localeCompare(y.nombre, "es")),
		nombre: (id) => nombres.get(id) ?? `#${id}`,
		votantes,
		elige,
		peso,
		opino: (a, b) => a !== b && (modo === "nominacion" ? votantes.has(a) : puntajes.get(a)?.has(b) === true),
		eleccionesDe: (a) => orden.get(a) ?? [],
		recibidas: (b) => recibidasMap.get(b) ?? 0,
		exposicion,
		mutuasDe: (a) => mutuas.get(a) ?? [],
		paresMutuos,
		bloqueado: (a, b) => bloqueos.has(clave(a, b)),
		rechazosRecibidos: (b) => rechazos.get(b) ?? 0,
		paresBloqueados
	};
}
/** Capacidades equilibradas: N alumnos en grupos de ~tamano (difieren a lo sumo en 1). */
function capacidades(n, tamano) {
	const numGrupos = Math.max(1, Math.ceil(n / Math.max(1, tamano)));
	const base = Math.floor(n / numGrupos);
	const extra = n % numGrupos;
	return Array.from({ length: numGrupos }, (_, i) => base + (i < extra ? 1 : 0));
}
/**
* Reparte una lista ya ordenada en "serpiente" (1,2,3…3,2,1) para que cada
* grupo reciba de cada franja del orden. Nunca junta a dos alumnos con pedido
* de no quedar juntos si existe algún grupo con lugar donde no choquen.
*/
function distribuirSerpentina(ordenados, tamano, bloqueado) {
	if (ordenados.length === 0) return [];
	const caps = capacidades(ordenados.length, tamano);
	const G = caps.length;
	const grupos = Array.from({ length: G }, () => []);
	const conflictos = (gi, x) => grupos[gi].filter((m) => bloqueado(m.id, x.id)).length;
	let g = 0;
	let dir = 1;
	const avanzar = () => {
		g += dir;
		if (g >= G) {
			g = G - 1;
			dir = -1;
		} else if (g < 0) {
			g = 0;
			dir = 1;
		}
	};
	for (const x of ordenados) {
		let elegido = -1;
		let gg = g;
		let dd = dir;
		for (let k = 0; k < 2 * G && elegido < 0; k++) {
			if (grupos[gg].length < caps[gg] && conflictos(gg, x) === 0) elegido = gg;
			gg += dd;
			if (gg >= G) {
				gg = G - 1;
				dd = -1;
			} else if (gg < 0) {
				gg = 0;
				dd = 1;
			}
		}
		if (elegido < 0) {
			let mejor = -1;
			for (let i = 0; i < G; i++) {
				if (grupos[i].length >= caps[i]) continue;
				if (mejor < 0 || conflictos(i, x) < conflictos(mejor, x) || conflictos(i, x) === conflictos(mejor, x) && grupos[i].length < grupos[mejor].length) mejor = i;
			}
			elegido = mejor < 0 ? 0 : mejor;
		}
		grupos[elegido].push(x);
		avanzar();
	}
	return repararBloqueos(grupos.filter((gr) => gr.length > 0), bloqueado);
}
/**
* Si quedó algún par con pedido de no estar juntos (los últimos en ubicarse
* pueden no tener opción), intercambia a uno de ellos con alguien de otro
* grupo siempre que baje la cantidad de choques. No toca nada más.
*/
function repararBloqueos(grupos, bloqueado) {
	const choques = (gr) => {
		let c = 0;
		for (let i = 0; i < gr.length; i++) for (let j = i + 1; j < gr.length; j++) if (bloqueado(gr[i].id, gr[j].id)) c++;
		return c;
	};
	for (let ronda = 0; ronda < 10; ronda++) {
		let cambio = false;
		for (let gi = 0; gi < grupos.length; gi++) {
			if (choques(grupos[gi]) === 0) continue;
			for (let a = 0; a < grupos[gi].length && choques(grupos[gi]) > 0; a++) for (let gj = 0; gj < grupos.length; gj++) {
				if (gj === gi) continue;
				let hecho = false;
				for (let b = 0; b < grupos[gj].length; b++) {
					const antes = choques(grupos[gi]) + choques(grupos[gj]);
					const x = grupos[gi][a];
					const y = grupos[gj][b];
					grupos[gi][a] = y;
					grupos[gj][b] = x;
					if (choques(grupos[gi]) + choques(grupos[gj]) < antes) {
						hecho = true;
						cambio = true;
						break;
					}
					grupos[gi][a] = x;
					grupos[gj][b] = y;
				}
				if (hecho) break;
			}
		}
		if (!cambio) break;
	}
	return grupos;
}
/**
* Mejora local: intercambia alumnos de la MISMA franja entre grupos (así no se
* rompe el equilibrio) para que cada uno tenga al menos un vínculo dentro de su
* grupo, y para deshacer pedidos de no quedar juntos que hayan quedado.
*/
function mejorarConApoyo(grupos, franjaDe, g, rondas = 20) {
	const res = grupos.map((gr) => [...gr]);
	const valor = (gr) => {
		let v = 0;
		for (const m of gr) if (gr.some((x) => x.id !== m.id && (g.elige(m.id, x.id) || g.elige(x.id, m.id)))) v += 1;
		for (let i = 0; i < gr.length; i++) for (let j = i + 1; j < gr.length; j++) if (g.bloqueado(gr[i].id, gr[j].id)) v -= 100;
		return v;
	};
	for (let r = 0; r < rondas; r++) {
		let mejoro = false;
		for (let gi = 0; gi < res.length; gi++) for (let gj = gi + 1; gj < res.length; gj++) for (let a = 0; a < res[gi].length; a++) for (let b = 0; b < res[gj].length; b++) {
			const x = res[gi][a];
			const y = res[gj][b];
			if (franjaDe(x.id) !== franjaDe(y.id)) continue;
			const antes = valor(res[gi]) + valor(res[gj]);
			res[gi][a] = y;
			res[gj][b] = x;
			if (valor(res[gi]) + valor(res[gj]) > antes) mejoro = true;
			else {
				res[gi][a] = x;
				res[gj][b] = y;
			}
		}
		if (!mejoro) break;
	}
	return res;
}
/** Barajado determinístico (misma semilla → mismo orden). */
function barajar(arr, semilla) {
	const a = [...arr];
	let t = semilla >>> 0;
	const rand = () => {
		t = t + 1831565813 | 0;
		let r = Math.imul(t ^ t >>> 15, 1 | t);
		r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r;
		return ((r ^ r >>> 14) >>> 0) / 4294967296;
	};
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
/** Grupos al azar (reproducibles por semilla) que respetan los pedidos de no quedar juntos. */
function agruparAlAzar(g, tamano, semilla) {
	return distribuirSerpentina(barajar(g.alumnos, semilla), tamano, g.bloqueado);
}
//#endregion
//#region src/lib/server/agrupamientos/roles.ts
var ROLES = [
	{
		id: "coordinacion",
		nombre: "Coordinación",
		alto: true,
		descripcion: "Organiza la tarea, se asegura de que todos participen y es quien consulta al docente."
	},
	{
		id: "relatoria",
		nombre: "Relatoría",
		alto: true,
		descripcion: "Presenta el trabajo del grupo frente a la clase."
	},
	{
		id: "registro",
		nombre: "Registro",
		alto: false,
		descripcion: "Anota las ideas y los acuerdos del grupo."
	},
	{
		id: "materiales",
		nombre: "Materiales",
		alto: false,
		descripcion: "Consigue, reparte y cuida los materiales."
	},
	{
		id: "tiempo",
		nombre: "Tiempo y armonía",
		alto: false,
		descripcion: "Cuida los tiempos y que todos se escuchen con respeto."
	}
];
var APOYO = {
	id: "apoyo",
	nombre: "Apoyo",
	alto: false,
	descripcion: "Colabora con el rol que más lo necesite."
};
/** Papeles de la tutoría entre pares (conviene alternarlos en parte de la actividad). */
var ROLES_TUTORIA = [
	{
		id: "tutor",
		nombre: "Tutor/a",
		alto: true,
		descripcion: "Explica, pregunta y acompaña sin resolver por el otro."
	},
	{
		id: "tutorado",
		nombre: "Tutorado/a",
		alto: false,
		descripcion: "Practica en voz alta, pregunta y corrige con ayuda."
	},
	{
		id: "par",
		nombre: "Par",
		alto: false,
		descripcion: "Sin nota cargada: el docente define quién tutorea."
	}
];
var ROL_POR_ID = new Map([
	...ROLES,
	APOYO,
	...ROLES_TUTORIA
].map((r) => [r.id, r]));
function costo(id, rol, ctx) {
	let c = 0;
	if (rol.alto && ctx.acompanar.has(id)) c -= 4;
	if (rol.alto && ctx.referentes.has(id)) c += 1;
	const previos = ctx.previos.get(id) ?? [];
	previos.slice(0, 3).forEach((p, i) => {
		if (p === rol.id) c += 3 - i;
	});
	if (rol.alto && previos[0] && ROL_POR_ID.get(previos[0])?.alto) c += 1;
	return c;
}
function permutaciones(n) {
	if (n === 0) return [[]];
	const res = [];
	for (const p of permutaciones(n - 1)) for (let i = 0; i <= p.length; i++) res.push([
		...p.slice(0, i),
		n - 1,
		...p.slice(i)
	]);
	return res;
}
var PERMS = /* @__PURE__ */ new Map();
var permsDe = (n) => {
	if (!PERMS.has(n)) PERMS.set(n, permutaciones(n));
	return PERMS.get(n);
};
/** Asigna un rol a cada miembro de cada grupo (determinístico). */
function asignarRoles(grupos, ctx) {
	return grupos.map((gr) => {
		const k = gr.length;
		if (k === 0) return [];
		if (k > 7) return gr.map((m, i) => ({
			...m,
			rol: ROLES[i]?.id ?? "apoyo"
		}));
		const roles = Array.from({ length: k }, (_, i) => ROLES[i] ?? APOYO);
		let mejor = [];
		let mejorCosto = Infinity;
		for (const p of permsDe(k)) {
			let c = 0;
			for (let i = 0; i < k; i++) c += costo(gr[i].id, roles[p[i]], ctx);
			if (c < mejorCosto) {
				mejorCosto = c;
				mejor = p;
			}
		}
		return gr.map((m, i) => ({
			...m,
			rol: roles[mejor[i]].id
		}));
	});
}
//#endregion
//#region src/lib/server/services/agrupamientos.ts
async function puedeVerSesion(usuarioId, sesion) {
	if (sesion.createdBy === usuarioId) return true;
	return veTodasLasSesiones(usuarioId);
}
async function puedeGestionarSesion(usuarioId, sesion) {
	if (sesion.createdBy === usuarioId) return true;
	return esDirectivoOAdmin(usuarioId);
}
async function listarSesiones(filtros = {}) {
	const conditions = [];
	if (filtros.estado) conditions.push(eq(agrupamientoSesiones.estado, filtros.estado));
	if (!filtros.verTodas && filtros.usuarioId != null) conditions.push(eq(agrupamientoSesiones.createdBy, filtros.usuarioId));
	const sesiones = await db.select().from(agrupamientoSesiones).where(conditions.length ? and(...conditions) : void 0).orderBy(desc(agrupamientoSesiones.fecha), desc(agrupamientoSesiones.createdAt));
	const conteos = await db.select({
		sesionId: agrupamientoVotos.sesionId,
		n: sql`count(*)`
	}).from(agrupamientoVotos).groupBy(agrupamientoVotos.sesionId);
	const porSesion = new Map(conteos.map((c) => [c.sesionId, Number(c.n)]));
	return sesiones.map((s) => ({
		...s,
		cantidadVotos: porSesion.get(s.id) ?? 0
	}));
}
async function contarSesionesDelCurso(cursoMoodleId) {
	const [r] = await db.select({ n: sql`count(*)` }).from(agrupamientoSesiones).where(eq(agrupamientoSesiones.cursoMoodleId, cursoMoodleId));
	return Number(r?.n ?? 0);
}
async function listarSesionesDelCurso(cursoMoodleId) {
	return db.select().from(agrupamientoSesiones).where(eq(agrupamientoSesiones.cursoMoodleId, cursoMoodleId)).orderBy(agrupamientoSesiones.fecha, agrupamientoSesiones.createdAt);
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
		modoVoto: "nominacion",
		cantidadEvaluar: data.cantidadEvaluar ?? 3,
		permiteBloqueo: data.permiteBloqueo ?? true,
		notas: data.notas ?? null,
		createdBy
	});
	return result.insertId;
}
function modoDe(sesion) {
	return sesion.modoVoto === "nominacion" ? "nominacion" : "calificacion";
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
		})).filter((c) => Number.isInteger(c.id) && c.id > 0 && Number.isInteger(c.puntaje) && c.puntaje >= 1 && c.puntaje <= 5);
	} catch {
		return [];
	}
}
function esDuplicado(e) {
	const err = e;
	return err?.code === "ER_DUP_ENTRY" || err?.cause?.code === "ER_DUP_ENTRY";
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
	try {
		await db.insert(agrupamientoVotos).values({
			sesionId,
			votanteMoodleId: voto.votanteMoodleId,
			votanteNombre: voto.votanteNombre,
			calificaciones: JSON.stringify(voto.calificaciones),
			bloqueadoMoodleId: voto.bloqueadoMoodleId ?? null,
			bloqueadoNombre: voto.bloqueadoNombre ?? null
		});
	} catch (e) {
		if (esDuplicado(e)) throw new Error("ya_voto");
		throw e;
	}
}
/** Borra un voto SOLO si pertenece a la sesión indicada. */
async function eliminarVoto(sesionId, votoId) {
	await db.delete(agrupamientoVotos).where(and(eq(agrupamientoVotos.id, votoId), eq(agrupamientoVotos.sesionId, sesionId)));
}
/**
* Procesa y guarda un voto desde el FormData del kiosko. Lógica compartida
* entre la votación interna y el link público con token.
*
* Nada de lo que manda el formulario se cree sin verificar contra la lista del
* curso: el votante tiene que ser alumno del curso, solo puede elegir/calificar
* a quienes corresponde, y los nombres se toman del padrón (no del form).
*/
async function procesarVotoDesdeForm(sesionId, fd, ctx) {
	const porId = new Map(ctx.roster.map((a) => [a.id, a]));
	const votanteMoodleId = Number(String(fd.get("votanteMoodleId") ?? ""));
	const votante = Number.isInteger(votanteMoodleId) ? porId.get(votanteMoodleId) : void 0;
	if (!votante) return { error: "Alumno inválido." };
	const nom = ctx.modo === "nominacion";
	const permitidos = nom ? new Set(ctx.roster.filter((a) => a.id !== votante.id).map((a) => a.id)) : new Set(asignarCompaneros(sesionId, votante.id, ctx.roster, ctx.cantidadEvaluar).map((a) => a.id));
	const calificaciones = [];
	try {
		const arr = JSON.parse(String(fd.get("calificaciones") ?? "[]"));
		if (!Array.isArray(arr)) return { error: "Datos de votación inválidos." };
		const vistos = /* @__PURE__ */ new Set();
		for (const c of arr) {
			const id = Number(c?.id);
			const puntaje = nom ? 5 : Number(c?.puntaje);
			if (!permitidos.has(id) || vistos.has(id)) continue;
			if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) continue;
			vistos.add(id);
			calificaciones.push({
				id,
				nombre: porId.get(id).nombre,
				puntaje
			});
		}
	} catch {
		return { error: "Datos de votación inválidos." };
	}
	if (nom) {
		if (calificaciones.length === 0) return { error: "Elegí al menos un compañero." };
		if (calificaciones.length > ctx.cantidadEvaluar) return { error: `Podés elegir hasta ${ctx.cantidadEvaluar} compañeros.` };
	} else {
		if (calificaciones.length === 0) return { error: "Tenés que calificar a tus compañeros." };
		if (calificaciones.every((c) => c.puntaje === 1)) return { error: "No podés calificar a todos con la puntuación mínima." };
	}
	const bloqRaw = ctx.permiteBloqueo ? String(fd.get("bloqueadoMoodleId") ?? "").trim() : "";
	const bloqueado = bloqRaw ? porId.get(Number(bloqRaw)) : void 0;
	if (bloqRaw && (!bloqueado || bloqueado.id === votante.id)) return { error: "Compañero inválido." };
	if (nom && bloqueado && calificaciones.some((c) => c.id === bloqueado.id)) return { error: "No podés elegir y a la vez pedir no trabajar con la misma persona." };
	try {
		await registrarVoto(sesionId, {
			votanteMoodleId: votante.id,
			votanteNombre: votante.nombre,
			calificaciones,
			bloqueadoMoodleId: bloqueado?.id ?? null,
			bloqueadoNombre: bloqueado?.nombre ?? null
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
async function generarVotosAleatorios(sesionId, roster, cantidad, modo = "calificacion") {
	const yaVotaron = await idsQueVotaron(sesionId);
	let generados = 0;
	for (const [idx, alumno] of roster.entries()) {
		if (yaVotaron.has(alumno.id)) continue;
		if (modo === "nominacion") {
			const cerca = roster.filter((a, j) => a.id !== alumno.id && Math.abs(j - idx) <= 3);
			const lejos = roster.filter((a, j) => a.id !== alumno.id && Math.abs(j - idx) > 3);
			const elegidos = shuffleSeeded(cerca, sesionId + alumno.id).slice(0, Math.max(1, cantidad - 1)).concat(shuffleSeeded(lejos, sesionId * 7 + alumno.id).slice(0, Math.random() < .5 ? 1 : 0)).slice(0, cantidad);
			const bloqueado = Math.random() < .15 && lejos.length ? lejos[Math.floor(Math.random() * lejos.length)] : null;
			try {
				await registrarVoto(sesionId, {
					votanteMoodleId: alumno.id,
					votanteNombre: alumno.nombre,
					calificaciones: elegidos.map((c) => ({
						id: c.id,
						nombre: c.nombre,
						puntaje: 5
					})),
					bloqueadoMoodleId: bloqueado && !elegidos.includes(bloqueado) ? bloqueado.id : null,
					bloqueadoNombre: bloqueado && !elegidos.includes(bloqueado) ? bloqueado.nombre : null
				});
				generados++;
			} catch {}
			continue;
		}
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
	return (await db.select().from(agrupamientoGrupos).where(eq(agrupamientoGrupos.sesionId, sesionId)).orderBy(desc(agrupamientoGrupos.createdAt))).map((r) => {
		let grupos = [];
		try {
			const parsed = JSON.parse(r.gruposJson);
			if (Array.isArray(parsed)) grupos = parsed;
		} catch {}
		return {
			...r,
			grupos
		};
	});
}
async function guardarGrupos(sesionId, nombre, modo, grupos, meta = null) {
	const [result] = await db.insert(agrupamientoGrupos).values({
		sesionId,
		nombre,
		modo,
		gruposJson: JSON.stringify(grupos),
		metaJson: meta ? JSON.stringify(meta) : null
	});
	return result.insertId;
}
/**
* Roles recientes de cada alumno en las agrupaciones guardadas del curso
* (el más reciente primero, hasta 3), para rotarlos.
*/
async function rolesPreviosDelCurso(cursoMoodleId) {
	const rows = await db.select({ gruposJson: agrupamientoGrupos.gruposJson }).from(agrupamientoGrupos).innerJoin(agrupamientoSesiones, eq(agrupamientoGrupos.sesionId, agrupamientoSesiones.id)).where(eq(agrupamientoSesiones.cursoMoodleId, cursoMoodleId)).orderBy(desc(agrupamientoGrupos.createdAt)).limit(20);
	const previos = /* @__PURE__ */ new Map();
	for (const r of rows) {
		let grupos;
		try {
			grupos = JSON.parse(r.gruposJson);
		} catch {
			continue;
		}
		if (!Array.isArray(grupos)) continue;
		for (const g of grupos) {
			if (!Array.isArray(g)) continue;
			for (const m of g) {
				const id = Number(m?.id);
				if (!Number.isInteger(id) || typeof m?.rol !== "string" || !ROL_POR_ID.has(m.rol)) continue;
				const lista = previos.get(id) ?? [];
				if (lista.length < 3) previos.set(id, [...lista, m.rol]);
			}
		}
	}
	return previos;
}
var EVALUACIONES = [
	"funciono",
	"regular",
	"no_funciono"
];
/** Registra cómo funcionó una agrupación guardada (SOLO si es de la sesión). */
async function evaluarGrupos(sesionId, id, evaluacion, nota) {
	await db.update(agrupamientoGrupos).set({
		evaluacion,
		evaluacionNota: nota,
		evaluadoAt: evaluacion ? /* @__PURE__ */ new Date() : null
	}).where(and(eq(agrupamientoGrupos.id, id), eq(agrupamientoGrupos.sesionId, sesionId)));
}
/** Cuántas agrupaciones funcionaron / regular / no, por modo, en esas sesiones. */
async function evaluacionesPorModo(sesionIds) {
	if (sesionIds.length === 0) return [];
	const rows = await db.select({
		modo: agrupamientoGrupos.modo,
		evaluacion: agrupamientoGrupos.evaluacion
	}).from(agrupamientoGrupos).where(inArray(agrupamientoGrupos.sesionId, sesionIds));
	const porModo = /* @__PURE__ */ new Map();
	for (const r of rows) {
		const c = porModo.get(r.modo) ?? {
			funciono: 0,
			regular: 0,
			no_funciono: 0,
			sinEvaluar: 0
		};
		if (r.evaluacion === "funciono" || r.evaluacion === "regular" || r.evaluacion === "no_funciono") c[r.evaluacion]++;
		else c.sinEvaluar++;
		porModo.set(r.modo, c);
	}
	return [...porModo.entries()].map(([modo, c]) => ({
		modo,
		...c
	}));
}
/** Borra una agrupación guardada SOLO si pertenece a la sesión indicada. */
async function eliminarGrupos(sesionId, id) {
	await db.delete(agrupamientoGrupos).where(and(eq(agrupamientoGrupos.id, id), eq(agrupamientoGrupos.sesionId, sesionId)));
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
			const grafo = construirGrafo(await listarVotos(row.sesion.id), grupos.flat().map((m) => ({
				id: Number(m.id),
				nombre: String(m.nombre ?? "")
			})).filter((m) => Number.isInteger(m.id) && m.id > 0), modoDe(row.sesion));
			analisisCache.set(row.sesion.id, analizarRelacionesSociales(grafo));
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
			rol: (() => {
				const r = miGrupo.find((m) => Number(m.id) === alumnoMoodleId)?.rol;
				return typeof r === "string" ? ROL_POR_ID.get(r)?.nombre ?? null : null;
			})(),
			notaPedagogica
		});
	}
	return entradas;
}

export { evaluarGrupos as A, asignarRoles as B, guardarGrupos as C, agruparAlAzar as D, listarGrupos as E, ROLES_TUTORIA as F, rolesPreviosDelCurso as G, capacidades as H, EVALUACIONES as I, procesarVotoDesdeForm as J, idsQueVotaron as K, asignarCompaneros as L, obtenerHistorialAgrupamientosDeAlumno as M, obtenerSesionPorToken as N, ROLES as R, mejorarConApoyo as a, repararBloqueos as b, puedeGestionarSesion as c, distribuirSerpentina as d, media as e, modoDe as f, listarVotos as g, analizarRelacionesSociales as h, construirGrafo as i, listarSesiones as j, evaluacionesPorModo as k, listarSesionesDelCurso as l, mediana as m, crearSesion as n, obtenerSesion as o, puedeVerSesion as p, eliminarSesion as q, redondear as r, editarSesion as s, eliminarTodosLosVotos as t, generarVotosAleatorios as u, eliminarVoto as v, quitarTokenVoto as w, generarTokenVoto as x, contarSesionesDelCurso as y, eliminarGrupos as z };
//# sourceMappingURL=agrupamientos-DwaMuOx0.js.map
