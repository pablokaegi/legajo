import { a as listarAlumnosDeCurso } from './cursos2-CxacCokc.js';
import { i as eliminarGrupos, j as guardarGrupos, o as obtenerSesion, h as listarVotos, k as listarGrupos } from './agrupamientos-MWeOpDHT.js';
import { a as media, r as redondear } from './stats-CbU88415.js';
import { redirect, fail, error } from '@sveltejs/kit';
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

//#region src/lib/server/agrupamientos/emparejar.ts
/**
* Forma grupos priorizando afinidades mutuas y evitando bloqueos.
* Sigue las 10 fases del algoritmo greedy original.
*
* @param votos  votos cargados de la sesión
* @param roster lista completa del curso (para sumar a los que no votaron)
*/
function generarEmparejamientos(votos, roster = [], opciones = {}) {
	const tamanoMax = opciones.tamanoMax ?? 4;
	const umbralPareja = opciones.umbralPareja ?? 3.5;
	const umbralGrupo = opciones.umbralGrupo ?? 3;
	const umbralResto = opciones.umbralResto ?? 2.5;
	if (votos.length === 0) return roster.map((a) => ({
		miembros: [a],
		afinidadPromedio: 0
	}));
	const porVotante = /* @__PURE__ */ new Map();
	const nombrePorId = /* @__PURE__ */ new Map();
	for (const v of votos) {
		porVotante.set(v.votanteMoodleId, v);
		nombrePorId.set(v.votanteMoodleId, v.votanteNombre);
		for (const c of v.calificaciones) nombrePorId.set(c.id, c.nombre);
	}
	for (const a of roster) nombrePorId.set(a.id, a.nombre);
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
	const sinGrupo = votos.map((v) => v.votanteMoodleId).filter((id) => !asignados.has(id));
	let i = 0;
	while (i < sinGrupo.length - 1) {
		const a = sinGrupo[i];
		let mejorJ = -1;
		let mejorAf = 0;
		for (let j = i + 1; j < sinGrupo.length; j++) {
			const b = sinGrupo[j];
			if (estaBloqueado(a, b)) continue;
			const r1 = rating(a, b);
			const r2 = rating(b, a);
			if (r1 != null && r2 != null) {
				const af = (r1 + r2) / 2;
				if (af > mejorAf) {
					mejorAf = af;
					mejorJ = j;
				}
			}
		}
		if (mejorJ >= 0 && mejorAf >= umbralResto) {
			const b = sinGrupo[mejorJ];
			grupos.push([a, b]);
			asignados.add(a);
			asignados.add(b);
			sinGrupo.splice(mejorJ, 1);
			sinGrupo.splice(i, 1);
		} else i++;
	}
	for (const id of sinGrupo) if (!asignados.has(id)) {
		grupos.push([id]);
		asignados.add(id);
	}
	for (const a of roster) if (!porVotante.has(a.id) && !asignados.has(a.id)) {
		grupos.push([a.id]);
		asignados.add(a.id);
	}
	grupos.sort((a, b) => b.length - a.length);
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
var load = async ({ locals, params, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const id = parseInt(params.id, 10);
	if (isNaN(id)) error(400, "ID inválido");
	const sesion = await obtenerSesion(id);
	if (!sesion) error(404, "Sesión no encontrada");
	const roster = (await listarAlumnosDeCurso(sesion.cursoMoodleId).catch(() => [])).map((u) => ({
		id: u.id,
		nombre: u.fullname
	}));
	const votos = await listarVotos(id);
	const tamRaw = parseInt(url.searchParams.get("tamano") ?? "4", 10);
	const tamano = isNaN(tamRaw) ? 4 : Math.max(2, Math.min(6, tamRaw));
	const afinidad = generarEmparejamientos(votos, roster);
	const heterogeneo = generarGruposEquilibrados(votos, roster, { tamano });
	const guardados = await listarGrupos(id);
	return {
		sesion,
		roster,
		totalVotos: votos.length,
		tamano,
		afinidad,
		heterogeneo,
		guardados
	};
};
var actions = {
	guardar: async ({ request, locals, params }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		const id = parseInt(params.id, 10);
		const fd = await request.formData();
		const nombre = fd.get("nombre")?.trim() || "Agrupación";
		const modo = fd.get("modo") || "afinidad";
		let grupos = [];
		try {
			const parsed = JSON.parse(fd.get("gruposJson") ?? "[]");
			if (Array.isArray(parsed)) grupos = parsed;
		} catch {
			return fail(400, { error: "Datos de agrupación inválidos." });
		}
		if (grupos.length === 0) return fail(400, { error: "No hay grupos para guardar." });
		await guardarGrupos(id, nombre, modo, grupos);
		return { ok: true };
	},
	eliminar: async ({ request, locals }) => {
		if (!locals.usuario) throw redirect(303, "/auth");
		const fd = await request.formData();
		const grupoId = parseInt(fd.get("grupoId")?.toString() ?? "0", 10);
		if (grupoId) await eliminarGrupos(grupoId);
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
const component = async () => component_cache ??= (await import('./_page.svelte-CbdkUpOv.js')).default;
const server_id = "src/routes/institucional/agrupamientos/[id]/resultados/+page.server.ts";
const imports = ["_app/immutable/nodes/16.CIj6tVTW.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/CxYS42Kd.js","_app/immutable/chunks/CEmSAoB3.js","_app/immutable/chunks/DBLIlT8e.js","_app/immutable/chunks/BEDIq91W.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=16-aHJITNTw.js.map
