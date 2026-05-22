import { b as listarAlumnosDeCurso } from './cursos2-mJdtD_zg.js';
import { o as obtenerSesion, h as listarVotos, i as analizarRelacionesSociales, r as redondear, j as desviacion, m as media } from './agrupamientos-lx1fDlSI.js';
import { o as obtenerConducta } from './perfilAlumnos-XY5tGMKr.js';
import { redirect, error } from '@sveltejs/kit';
import './client-BJtlkHyJ.js';
import './shared-server-asDUS7ug.js';
import './db-DpfkJINj.js';
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
//#region src/routes/agrupamientos/[id]/estadisticas/+page.server.ts
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

const index = 9;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Dj3akhIM.js')).default;
const server_id = "src/routes/agrupamientos/[id]/estadisticas/+page.server.ts";
const imports = ["_app/immutable/nodes/9.CuYk3uRb.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/BEDIq91W.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=9-C0c-l09s.js.map
