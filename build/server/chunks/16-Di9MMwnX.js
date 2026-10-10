import { b as listarAlumnosDeCurso } from './cursos2-CO8sxrLe.js';
import { v as eliminarGrupos, w as evaluarGrupos, e as construirGrafo, f as modoDe, c as listarVotos, x as asignarRoles, d as analizarRelacionesSociales, y as guardarGrupos, a as puedeGestionarSesion, z as agruparAlAzar, A as listarGrupos, B as mejorarConApoyo, C as distribuirSerpentina, R as ROLES, D as ROLES_TUTORIA, E as rolesPreviosDelCurso, F as capacidades, G as mediana, u as redondear, H as repararBloqueos, I as EVALUACIONES } from './agrupamientos-Bz0E4k6X.js';
import { a as exigirSesion } from './acceso-1KCvqAgn.js';
import { a as obtenerNotasMoodle, o as obtenerConducta } from './perfilAlumnos-EOzVLgao.js';
import { fail } from '@sveltejs/kit';
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

//#region src/lib/server/agrupamientos/gruposTrabajo.ts
/** Proporción de elecciones recibidas sobre las posibles; null si no hay base. */
function tasaEleccion(g, id) {
	const e = g.exposicion(id);
	return e > 0 ? g.recibidas(id) / e : null;
}
function generarGruposEquilibrados(g, opciones = {}) {
	const tamano = Math.max(2, Math.min(6, opciones.tamano ?? 4));
	if (g.alumnos.length < 2) return [];
	const conBase = g.alumnos.map((a) => tasaEleccion(g, a.id)).filter((t) => t != null);
	const neutro = conBase.length ? mediana(conBase) : 0;
	const estatus = (id) => tasaEleccion(g, id) ?? neutro;
	const ordenados = [...g.alumnos].sort((a, b) => estatus(b.id) - estatus(a.id) || a.id - b.id);
	const tercio = Math.max(1, Math.floor(ordenados.length / 3));
	const nivelPorId = /* @__PURE__ */ new Map();
	ordenados.forEach((a, i) => {
		nivelPorId.set(a.id, i < tercio ? "alto" : i < tercio * 2 ? "medio" : "bajo");
	});
	const nivel = (id) => nivelPorId.get(id) ?? "medio";
	return mejorarConApoyo(distribuirSerpentina(ordenados, tamano, g.bloqueado), nivel, g).map((gr) => ({
		miembros: gr.map((m) => ({
			...m,
			nivel: nivel(m.id)
		})),
		estatusPromedio: redondear(gr.reduce((s, m) => s + estatus(m.id), 0) / gr.length),
		sinVinculo: gr.filter((m) => !gr.some((x) => x.id !== m.id && (g.elige(m.id, x.id) || g.elige(x.id, m.id)))).length
	}));
}
//#endregion
//#region src/lib/server/agrupamientos/ubicacion.ts
var NUNCA = -1e3;
function generarUbicacion(g, analisis) {
	const alumnos = g.alumnos;
	if (alumnos.length === 0) return [];
	const ref = (id) => ({
		id,
		nombre: g.nombre(id)
	});
	const vulnerables = (analisis?.paraAcompanar ?? []).filter((p) => alumnos.some((a) => a.id === p.id)).map((p) => p.id);
	const esVulnerable = new Set(vulnerables);
	const tasas = alumnos.map((a) => tasaEleccion(g, a.id)).filter((t) => t != null);
	const med = tasas.length ? mediana(tasas) : 0;
	const aceptado = (id) => (tasaEleccion(g, id) ?? 0) >= med && g.rechazosRecibidos(id) === 0 && !esVulnerable.has(id);
	const puntaje = (v, p) => {
		if (g.bloqueado(v, p)) return NUNCA;
		let s = 0;
		if (aceptado(p)) s += 3;
		if (g.elige(v, p)) s += 2;
		if (g.elige(p, v)) s += 1;
		if (esVulnerable.has(p)) s -= 2;
		return s;
	};
	const lazo = (a, b) => g.bloqueado(a, b) ? NUNCA : (g.elige(a, b) ? 1 : 0) + (g.elige(b, a) ? 1 : 0);
	const libre = new Set(alumnos.map((a) => a.id));
	const bancosApoyo = [];
	const bancos = [];
	for (const v of vulnerables) {
		if (!libre.has(v)) continue;
		let mejor = -1;
		let mejorP = NUNCA;
		for (const p of libre) {
			if (p === v) continue;
			const s = puntaje(v, p);
			if (s > mejorP || s === mejorP && mejor >= 0 && p < mejor) {
				mejorP = s;
				mejor = p;
			}
		}
		if (mejor < 0 || mejorP <= NUNCA) continue;
		libre.delete(v);
		libre.delete(mejor);
		const razones = [];
		if (aceptado(mejor)) razones.push("bien aceptado por el curso");
		if (g.elige(v, mejor)) razones.push(`${g.nombre(v)} lo había elegido`);
		if (g.elige(mejor, v)) razones.push(`eligió a ${g.nombre(v)}`);
		bancosApoyo.push({
			asientos: [ref(v), ref(mejor)],
			motivo: `Acompañamiento: junto a ${g.nombre(mejor)}${razones.length ? ` (${razones.join(", ")})` : ""}.`
		});
	}
	const restantes = () => [...libre].sort((a, b) => a - b);
	for (const [a, b] of g.paresMutuos) if (libre.has(a) && libre.has(b) && !g.bloqueado(a, b)) {
		libre.delete(a);
		libre.delete(b);
		bancos.push({ asientos: [ref(a), ref(b)] });
	}
	while (libre.size >= 2) {
		const ids = restantes();
		const a = ids[0];
		let mejor = -1;
		let mejorL = NUNCA - 1;
		for (const b of ids.slice(1)) {
			const l = lazo(a, b);
			if (l > mejorL) {
				mejorL = l;
				mejor = b;
			}
		}
		libre.delete(a);
		libre.delete(mejor);
		bancos.push({ asientos: [ref(a), ref(mejor)] });
	}
	if (libre.size === 1) {
		const x = [...libre][0];
		const todos = [...bancosApoyo, ...bancos];
		let destino = todos.find((b) => b.asientos.every((m) => !g.bloqueado(m.id, x))) ?? todos[0];
		let mejor = NUNCA;
		for (const b of todos) {
			const s = b.asientos.reduce((acc, m) => acc + lazo(x, m.id), 0);
			if (s > mejor) {
				mejor = s;
				destino = b;
			}
		}
		if (destino) destino.asientos.push(ref(x));
		else bancos.push({ asientos: [ref(x)] });
	}
	repararBloqueos(bancos.map((b) => b.asientos), g.bloqueado).forEach((asientos, i) => bancos[i].asientos = asientos);
	if (bancosApoyo.length === 0) return bancos;
	const total = bancosApoyo.length + bancos.length;
	const paso = total / bancosApoyo.length;
	const posApoyo = new Set(bancosApoyo.map((_, k) => Math.floor(k * paso + paso / 2)));
	const resultado = [];
	let ia = 0;
	let ib = 0;
	for (let i = 0; i < total; i++) if (posApoyo.has(i) && ia < bancosApoyo.length || ib >= bancos.length) resultado.push(bancosApoyo[ia++]);
	else resultado.push(bancos[ib++]);
	return resultado;
}
//#endregion
//#region src/lib/server/agrupamientos/tutoria.ts
function generarTutorias(conNota, g) {
	const conN = conNota.filter((a) => a.nota != null).sort((a, b) => b.nota - a.nota || a.id - b.id);
	const sinN = conNota.filter((a) => a.nota == null);
	const h = Math.floor(conN.length / 2);
	const fuertes = conN.slice(0, h);
	const debiles = conN.slice(h);
	const vinculo = (a, b) => g.elige(a, b) || g.elige(b, a);
	const choca = (i) => i < fuertes.length && g.bloqueado(fuertes[i].id, debiles[i].id);
	for (let i = 0; i < fuertes.length; i++) {
		if (!choca(i)) continue;
		for (const d of [
			1,
			-1,
			2,
			-2
		]) {
			const j = i + d;
			if (j < 0 || j >= fuertes.length) continue;
			[debiles[i], debiles[j]] = [debiles[j], debiles[i]];
			if (!choca(i) && !choca(j)) break;
			[debiles[i], debiles[j]] = [debiles[j], debiles[i]];
		}
	}
	for (let i = 0; i + 1 < fuertes.length; i++) {
		const antes = Number(vinculo(fuertes[i].id, debiles[i].id)) + Number(vinculo(fuertes[i + 1].id, debiles[i + 1].id));
		if (Number(vinculo(fuertes[i].id, debiles[i + 1].id)) + Number(vinculo(fuertes[i + 1].id, debiles[i].id)) > antes && !g.bloqueado(fuertes[i].id, debiles[i + 1].id) && !g.bloqueado(fuertes[i + 1].id, debiles[i].id)) [debiles[i], debiles[i + 1]] = [debiles[i + 1], debiles[i]];
	}
	const pares = fuertes.map((f, i) => [{
		...f,
		rol: "tutor"
	}, {
		...debiles[i],
		rol: "tutorado"
	}]);
	if (debiles.length > fuertes.length) {
		const extra = {
			...debiles[debiles.length - 1],
			rol: "tutorado"
		};
		if (pares.length > 0) pares[pares.length - 1].push(extra);
		else pares.push([extra]);
	}
	for (let i = 0; i < sinN.length; i += 2) pares.push(sinN.slice(i, i + 2).map((a) => ({
		...a,
		rol: "par"
	})));
	return repararChoques(pares, g);
}
/**
* Si quedó algún par con pedido de no estar juntos, intercambia a un tutorado
* (o "par") con el del par más cercano en la lista, para no agrandar la brecha.
*/
function repararChoques(pares, g) {
	const choques = (p) => {
		let c = 0;
		for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) if (g.bloqueado(p[i].id, p[j].id)) c++;
		return c;
	};
	for (let i = 0; i < pares.length; i++) for (let a = 0; a < pares[i].length && choques(pares[i]) > 0; a++) {
		const x = pares[i][a];
		if (x.rol === "tutor") continue;
		let hecho = false;
		for (let d = 1; d < pares.length && !hecho; d++) for (const j of [i + d, i - d]) {
			if (j < 0 || j >= pares.length || hecho) continue;
			for (let b = 0; b < pares[j].length; b++) {
				const y = pares[j][b];
				if (y.rol === "tutor") continue;
				const antes = choques(pares[i]) + choques(pares[j]);
				pares[i][a] = {
					...y,
					rol: x.rol
				};
				pares[j][b] = {
					...x,
					rol: y.rol
				};
				if (choques(pares[i]) + choques(pares[j]) < antes) {
					hecho = true;
					break;
				}
				pares[i][a] = x;
				pares[j][b] = y;
			}
		}
	}
	return pares;
}
//#endregion
//#region src/lib/server/agrupamientos/emparejar.ts
var BLOQUEO = 100;
var APOYO = 2;
function generarEmparejamientos(g, opciones = {}) {
	const tamano = Math.max(2, Math.min(6, opciones.tamano ?? 4));
	const ids = g.alumnos.map((a) => a.id);
	if (ids.length === 0) return [];
	const caps = capacidades(ids.length, tamano);
	const G = caps.length;
	const lazo = (a, b) => g.peso(a, b) + g.peso(b, a) + (g.elige(a, b) && g.elige(b, a) ? 1 : 0);
	const tieneVinculo = (m, grupo) => grupo.some((x) => x !== m && (g.elige(m, x) || g.elige(x, m)));
	const valor = (grupo) => {
		let v = 0;
		for (let i = 0; i < grupo.length; i++) {
			for (let j = i + 1; j < grupo.length; j++) {
				v += lazo(grupo[i], grupo[j]);
				if (g.bloqueado(grupo[i], grupo[j])) v -= BLOQUEO;
			}
			if (tieneVinculo(grupo[i], grupo)) v += APOYO;
		}
		return v;
	};
	const grupos = Array.from({ length: G }, () => []);
	const asignado = /* @__PURE__ */ new Set();
	const hayLugar = (gi) => grupos[gi].length < caps[gi];
	const enCurso = new Set(ids);
	const parejas = [];
	for (const a of ids) for (const b of g.eleccionesDe(a)) if (enCurso.has(b) && (a < b || !g.elige(b, a))) parejas.push([a, b]);
	const candidatas = parejas.filter(([a, b]) => !g.bloqueado(a, b)).sort((x, y) => lazo(y[0], y[1]) - lazo(x[0], x[1]) || x[0] - y[0] || x[1] - y[1]);
	let sembrados = 0;
	for (const [a, b] of candidatas) {
		if (sembrados >= G) break;
		if (asignado.has(a) || asignado.has(b) || caps[sembrados] < 2) continue;
		grupos[sembrados].push(a, b);
		asignado.add(a);
		asignado.add(b);
		sembrados++;
	}
	for (;;) {
		let mejor = null;
		for (const id of ids) {
			if (asignado.has(id)) continue;
			for (let gi = 0; gi < G; gi++) {
				if (!hayLugar(gi) || grupos[gi].length === 0) continue;
				if (grupos[gi].some((m) => g.bloqueado(m, id))) continue;
				let ganancia = 0;
				for (const m of grupos[gi]) ganancia += lazo(id, m);
				if (ganancia <= 0) continue;
				if (!mejor || ganancia > mejor.ganancia || ganancia === mejor.ganancia && grupos[gi].length < grupos[mejor.gi].length) mejor = {
					id,
					gi,
					ganancia
				};
			}
		}
		if (!mejor) break;
		grupos[mejor.gi].push(mejor.id);
		asignado.add(mejor.id);
	}
	for (const id of ids) {
		if (asignado.has(id)) continue;
		let destino = -1;
		for (let gi = 0; gi < G; gi++) {
			if (!hayLugar(gi)) continue;
			const choca = grupos[gi].some((m) => g.bloqueado(m, id));
			if (destino < 0) {
				destino = gi;
				continue;
			}
			const chocaDest = grupos[destino].some((m) => g.bloqueado(m, id));
			if (chocaDest && !choca || choca === chocaDest && grupos[gi].length < grupos[destino].length) destino = gi;
		}
		grupos[destino < 0 ? 0 : destino].push(id);
		asignado.add(id);
	}
	for (let ronda = 0; ronda < 30; ronda++) {
		let mejoro = false;
		for (let gi = 0; gi < G; gi++) for (let gj = gi + 1; gj < G; gj++) for (let a = 0; a < grupos[gi].length; a++) for (let b = 0; b < grupos[gj].length; b++) {
			const x = grupos[gi][a];
			const y = grupos[gj][b];
			const antes = valor(grupos[gi]) + valor(grupos[gj]);
			grupos[gi][a] = y;
			grupos[gj][b] = x;
			if (valor(grupos[gi]) + valor(grupos[gj]) > antes + 1e-9) mejoro = true;
			else {
				grupos[gi][a] = x;
				grupos[gj][b] = y;
			}
		}
		if (!mejoro) break;
	}
	return grupos.filter((gr) => gr.length > 0).map((gr) => {
		let mutuas = 0;
		let vinculos = 0;
		for (const a of gr) for (const b of gr) {
			if (a === b) continue;
			if (g.elige(a, b)) vinculos++;
			if (a < b && g.elige(a, b) && g.elige(b, a)) mutuas++;
		}
		const ref = (id) => ({
			id,
			nombre: g.nombre(id)
		});
		return {
			miembros: gr.map(ref),
			mutuas,
			vinculos,
			sinVinculo: gr.filter((m) => !tieneVinculo(m, gr)).map(ref)
		};
	}).sort((x, y) => y.mutuas - x.mutuas || y.vinculos - x.vinculos);
}
//#endregion
//#region src/routes/agrupamientos/[id]/resultados/+page.server.ts
var load = async ({ locals, params, url }) => {
	const { sesion, usuarioId } = await exigirSesion(locals.usuario, params.id, "ver");
	const id = sesion.id;
	const puedeGestionar = await puedeGestionarSesion(usuarioId, sesion);
	const modo = modoDe(sesion);
	const roster = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => [])).map((u) => ({
		id: u.id,
		nombre: u.fullname
	}));
	const votos = await listarVotos(id);
	const grafo = construirGrafo(votos, roster, modo);
	const tamRaw = parseInt(url.searchParams.get("tamano") ?? "4", 10);
	const tamano = isNaN(tamRaw) ? 4 : Math.max(2, Math.min(6, tamRaw));
	const semRaw = parseInt(url.searchParams.get("semilla") ?? "", 10);
	const semilla = isNaN(semRaw) ? id : semRaw;
	const afinidad = generarEmparejamientos(grafo, { tamano });
	const heterogeneo = generarGruposEquilibrados(grafo, { tamano });
	const aleatorio = agruparAlAzar(grafo, tamano, semilla);
	const guardados = await listarGrupos(id);
	let rendimiento = null;
	let tutoria = null;
	if (url.searchParams.get("rendimiento") === "1") {
		const alumnos = grafo.alumnos;
		const notas = await obtenerNotasMoodle(sesion.cursoMoodleId, alumnos.map((a) => a.id));
		const conNota = alumnos.map((a) => ({
			id: a.id,
			nombre: a.nombre,
			nota: notas.get(a.id) ?? null
		}));
		const ordenados = [...conNota].sort((a, b) => (b.nota ?? -1) - (a.nota ?? -1) || a.id - b.id);
		const conN = ordenados.filter((a) => a.nota != null).length;
		const franja = /* @__PURE__ */ new Map();
		ordenados.forEach((a, i) => {
			franja.set(a.id, a.nota == null ? "sin" : String(Math.floor(i * 3 / Math.max(1, conN))));
		});
		rendimiento = {
			grupos: mejorarConApoyo(distribuirSerpentina(ordenados, tamano, grafo.bloqueado), (aid) => franja.get(aid) ?? "sin", grafo),
			sinNota: conNota.filter((a) => a.nota == null).length
		};
		tutoria = generarTutorias(conNota, grafo);
	}
	const analisis = analizarRelacionesSociales(grafo);
	const ubicacion = generarUbicacion(grafo, analisis);
	const ctxRoles = await contextoRoles(sesion.cursoMoodleId, analisis);
	const rolesDe = (grupos) => {
		const r = {};
		for (const gr of asignarRoles(grupos, ctxRoles)) for (const m of gr) r[m.id] = m.rol;
		return r;
	};
	const roles = {
		afinidad: rolesDe(afinidad.map((x) => x.miembros)),
		heterogeneo: rolesDe(heterogeneo.map((x) => x.miembros)),
		aleatorio: rolesDe(aleatorio),
		...rendimiento ? { rendimiento: rolesDe(rendimiento.grupos) } : {}
	};
	const conductaMap = await obtenerConducta(roster.map((a) => a.id));
	const conducta = roster.map((a) => ({
		...a,
		...conductaMap.get(a.id)
	}));
	return {
		sesion,
		roster,
		modo,
		totalVotos: votos.length,
		tamano,
		semilla,
		afinidad,
		heterogeneo,
		aleatorio,
		rendimiento,
		tutoria,
		ubicacion,
		roles,
		rolesInfo: [...ROLES, ...ROLES_TUTORIA],
		conducta,
		guardados,
		puedeGestionar,
		bloqueos: grafo.paresBloqueados.length
	};
};
async function contextoRoles(cursoMoodleId, analisis) {
	return {
		acompanar: new Set(analisis?.paraAcompanar.map((p) => p.id) ?? []),
		referentes: new Set(analisis?.referentes.map((r) => r.id) ?? []),
		previos: await rolesPreviosDelCurso(cursoMoodleId).catch(() => /* @__PURE__ */ new Map())
	};
}
var MODOS = new Set([
	"afinidad",
	"rendimiento",
	"heterogeneo",
	"aleatorio",
	"manual",
	"ubicacion",
	"tutoria"
]);
var actions = {
	guardar: async ({ request, locals, params }) => {
		const { sesion } = await exigirSesion(locals.usuario, params.id, "gestionar");
		const fd = await request.formData();
		const nombre = (fd.get("nombre")?.trim() || "Agrupación").slice(0, 200);
		const modoRaw = fd.get("modo") || "afinidad";
		const modo = MODOS.has(modoRaw) ? modoRaw : "manual";
		const roster = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => [])).map((u) => ({
			id: u.id,
			nombre: u.fullname
		}));
		if (roster.length === 0) return fail(503, { error: "No se pudo obtener la lista del curso." });
		const porId = new Map(roster.map((a) => [a.id, a]));
		const ROLES_TUT = new Set([
			"tutor",
			"tutorado",
			"par"
		]);
		let grupos = [];
		try {
			const parsed = JSON.parse(fd.get("gruposJson") ?? "[]");
			if (!Array.isArray(parsed)) return fail(400, { error: "Datos de agrupación inválidos." });
			const usados = /* @__PURE__ */ new Set();
			for (const g of parsed) {
				if (!Array.isArray(g)) continue;
				const miembros = [];
				for (const m of g) {
					const a = porId.get(Number(m?.id));
					if (!a || usados.has(a.id)) continue;
					usados.add(a.id);
					const rol = modo === "tutoria" && typeof m?.rol === "string" && ROLES_TUT.has(m.rol) ? m.rol : void 0;
					miembros.push(rol ? {
						...a,
						rol
					} : a);
				}
				if (miembros.length > 0) grupos.push(miembros);
			}
		} catch {
			return fail(400, { error: "Datos de agrupación inválidos." });
		}
		if (grupos.length === 0) return fail(400, { error: "No hay grupos para guardar." });
		let aGuardar = grupos;
		if (fd.get("conRoles") === "1" && modo !== "ubicacion" && modo !== "tutoria") {
			const grafo = construirGrafo(await listarVotos(sesion.id), roster, modoDe(sesion));
			aGuardar = asignarRoles(grupos, await contextoRoles(sesion.cursoMoodleId, analizarRelacionesSociales(grafo)));
		}
		const colRaw = parseInt(fd.get("columnas")?.toString() ?? "", 10);
		const meta = modo === "ubicacion" && !isNaN(colRaw) ? { columnas: Math.max(1, Math.min(6, colRaw)) } : null;
		await guardarGrupos(sesion.id, nombre, modo, aGuardar, meta);
		return { ok: true };
	},
	evaluar: async ({ request, locals, params }) => {
		const { sesion } = await exigirSesion(locals.usuario, params.id, "gestionar");
		const fd = await request.formData();
		const grupoId = parseInt(fd.get("grupoId")?.toString() ?? "0", 10);
		const ev = fd.get("evaluacion")?.toString() ?? "";
		const evaluacion = EVALUACIONES.includes(ev) ? ev : null;
		const nota = (fd.get("nota")?.toString().trim() || "").slice(0, 1e3) || null;
		if (!grupoId) return fail(400, { error: "Agrupación inválida." });
		await evaluarGrupos(sesion.id, grupoId, evaluacion, evaluacion ? nota : null);
		return { ok: true };
	},
	eliminar: async ({ request, locals, params }) => {
		const { sesion } = await exigirSesion(locals.usuario, params.id, "gestionar");
		const fd = await request.formData();
		const grupoId = parseInt(fd.get("grupoId")?.toString() ?? "0", 10);
		if (grupoId) await eliminarGrupos(sesion.id, grupoId);
		return { ok: true };
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 16;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BsHVudwd.js')).default;
const server_id = "src/routes/agrupamientos/[id]/resultados/+page.server.ts";
const imports = ["_app/immutable/nodes/16.BqF4E-Fa.js","_app/immutable/chunks/BYJUstCy.js","_app/immutable/chunks/W2mP2Oat.js","_app/immutable/chunks/L0rYaQvg.js","_app/immutable/chunks/CqiROUDz.js","_app/immutable/chunks/BD-4OuCl.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=16-Di9MMwnX.js.map
