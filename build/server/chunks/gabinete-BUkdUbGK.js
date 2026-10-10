import { d as db, n as gabineteCasos, u as usuarios, p as gabineteIntervenciones, r as roles, q as faltas, h as faltasAlumnos, j as amonestaciones, o as observaciones } from './db-DnDhVbjt.js';
import { l as listarSesionesDelCurso, f as modoDe, g as listarVotos, h as analizarRelacionesSociales, i as construirGrafo } from './agrupamientos-DwaMuOx0.js';
import { o as obtenerNotasMoodle } from './perfilAlumnos-LVNftgNy.js';
import { f as fechaMasDias, D as DIAS_REVISION, e as evaluarAlumno } from './guia-Cz0z5vQo.js';
import { sql, and, ne, lt, eq, desc, inArray } from 'drizzle-orm';

//#region src/lib/server/services/gabinete.ts
async function crearCaso(data) {
	const nivel = data.nivel ?? 2;
	const [res] = await db.insert(gabineteCasos).values({
		alumnoMoodleId: data.alumnoMoodleId,
		alumnoNombre: data.alumnoNombre,
		cursoMoodleId: data.cursoMoodleId,
		cursoNombre: data.cursoNombre,
		estado: data.estado ?? "derivado",
		nivel,
		motivo: data.motivo,
		fortalezas: data.fortalezas ?? null,
		origen: data.origen,
		derivadoPor: data.derivadoPor,
		proximaRevision: fechaMasDias(DIAS_REVISION[nivel] ?? 28)
	});
	return Number(res.insertId);
}
/** Caso abierto (no cerrado) más reciente del alumno, si existe. */
async function casoAbiertoDe(alumnoMoodleId) {
	const [c] = await db.select().from(gabineteCasos).where(and(eq(gabineteCasos.alumnoMoodleId, alumnoMoodleId), ne(gabineteCasos.estado, "cerrado"))).orderBy(desc(gabineteCasos.createdAt)).limit(1);
	return c ?? null;
}
/**
* Derivación de un docente/preceptor. Si el alumno ya tiene un caso abierto,
* se suma al registro de ese caso (no se duplica).
*/
async function registrarDerivacion(data) {
	const abierto = await casoAbiertoDe(data.alumnoMoodleId);
	if (abierto) {
		await agregarIntervencion({
			casoId: abierto.id,
			tipo: "derivacion",
			fecha: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			descripcion: data.motivo + (data.fortalezas ? `\n\nFortalezas señaladas: ${data.fortalezas}` : ""),
			acuerdos: null,
			autorId: data.derivadoPor
		});
		return {
			casoId: abierto.id,
			nuevo: false
		};
	}
	return {
		casoId: await crearCaso({
			...data,
			origen: "derivacion",
			estado: "derivado",
			nivel: 2
		}),
		nuevo: true
	};
}
async function listarCasos(filtros = {}) {
	const conds = [];
	if (filtros.estado === "abiertos") conds.push(ne(gabineteCasos.estado, "cerrado"));
	else if (filtros.estado) conds.push(eq(gabineteCasos.estado, filtros.estado));
	if (filtros.nivel) conds.push(eq(gabineteCasos.nivel, filtros.nivel));
	if (filtros.alumnoMoodleId) conds.push(eq(gabineteCasos.alumnoMoodleId, filtros.alumnoMoodleId));
	return db.select({
		caso: gabineteCasos,
		responsable: usuarios.nombre
	}).from(gabineteCasos).leftJoin(usuarios, eq(gabineteCasos.responsableId, usuarios.id)).where(conds.length ? and(...conds) : void 0).orderBy(desc(gabineteCasos.nivel), gabineteCasos.proximaRevision, desc(gabineteCasos.createdAt));
}
async function obtenerCaso(id) {
	const [row] = await db.select({
		caso: gabineteCasos,
		derivadoPorNombre: usuarios.nombre
	}).from(gabineteCasos).innerJoin(usuarios, eq(gabineteCasos.derivadoPor, usuarios.id)).where(eq(gabineteCasos.id, id)).limit(1);
	if (!row) return null;
	const intervenciones = await db.select({
		i: gabineteIntervenciones,
		autor: usuarios.nombre
	}).from(gabineteIntervenciones).innerJoin(usuarios, eq(gabineteIntervenciones.autorId, usuarios.id)).where(eq(gabineteIntervenciones.casoId, id)).orderBy(desc(gabineteIntervenciones.fecha), desc(gabineteIntervenciones.createdAt));
	return {
		...row,
		intervenciones
	};
}
async function actualizarCaso(id, data) {
	const extra = {};
	if (data.estado === "cerrado") extra.cerradoAt = /* @__PURE__ */ new Date();
	else if (data.estado) extra.cerradoAt = null;
	await db.update(gabineteCasos).set({
		...data,
		...extra,
		updatedAt: /* @__PURE__ */ new Date()
	}).where(eq(gabineteCasos.id, id));
}
async function agregarIntervencion(data) {
	await db.insert(gabineteIntervenciones).values(data);
	await db.update(gabineteCasos).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq(gabineteCasos.id, data.casoId));
}
/** Personas que pueden ser responsables de un caso (gabinete y admin). */
async function listarEquipoGabinete() {
	return await db.selectDistinct({
		id: usuarios.id,
		nombre: usuarios.nombre
	}).from(usuarios).innerJoin(roles, eq(roles.usuarioId, usuarios.id)).where(and(inArray(roles.rol, ["gabinete", "admin"]), eq(usuarios.activo, true))).orderBy(usuarios.nombre);
}
async function resumenTablero() {
	const hoy = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const [porEstado, vencidas, nivel3] = await Promise.all([
		db.select({
			estado: gabineteCasos.estado,
			n: sql`count(*)`
		}).from(gabineteCasos).groupBy(gabineteCasos.estado),
		db.select({ caso: gabineteCasos }).from(gabineteCasos).where(and(ne(gabineteCasos.estado, "cerrado"), lt(gabineteCasos.proximaRevision, hoy))).orderBy(gabineteCasos.proximaRevision),
		db.select({ n: sql`count(*)` }).from(gabineteCasos).where(and(ne(gabineteCasos.estado, "cerrado"), eq(gabineteCasos.nivel, 3)))
	]);
	const conteo = {};
	for (const r of porEstado) conteo[r.estado] = Number(r.n);
	return {
		conteo,
		abiertos: Object.entries(conteo).filter(([e]) => e !== "cerrado").reduce((s, [, n]) => s + n, 0),
		vencidas: vencidas.map((v) => v.caso),
		nivel3: Number(nivel3[0]?.n ?? 0)
	};
}
/** Casos abiertos por alumno (para marcar en el tablero de alerta). */
async function casosAbiertosPorAlumno(alumnoIds) {
	const res = /* @__PURE__ */ new Map();
	if (alumnoIds.length === 0) return res;
	const rows = await db.select({
		id: gabineteCasos.id,
		alumno: gabineteCasos.alumnoMoodleId
	}).from(gabineteCasos).where(and(inArray(gabineteCasos.alumnoMoodleId, alumnoIds), ne(gabineteCasos.estado, "cerrado")));
	for (const r of rows) res.set(r.alumno, r.id);
	return res;
}
/** Inicio del ciclo lectivo (1 de marzo; antes de marzo, el del año anterior). */
function inicioCiclo(hoy = /* @__PURE__ */ new Date()) {
	const anio = hoy.getMonth() >= 2 ? hoy.getFullYear() : hoy.getFullYear() - 1;
	return new Date(anio, 2, 1);
}
var DIA = 1440 * 60 * 1e3;
var aFecha = (v) => v instanceof Date ? v : new Date(String(v));
/** Lectura social de las últimas votaciones por nominación del curso. */
async function lecturaSocial(cursoId, roster) {
	const ultimas = (await listarSesionesDelCurso(cursoId)).filter((s) => modoDe(s) === "nominacion").slice(-3);
	const lecturas = [];
	for (const s of ultimas) {
		const votos = await listarVotos(s.id);
		if (votos.length === 0) continue;
		const an = analizarRelacionesSociales(construirGrafo(votos, roster, "nominacion"));
		if (!an) continue;
		lecturas.push({
			acomp: new Set(an.paraAcompanar.map((p) => p.id)),
			metricas: new Map(an.metricas.map((m) => [m.id, {
				recibidas: m.recibidas,
				exposicion: m.exposicion
			}]))
		});
	}
	return lecturas;
}
async function alertaDelCurso(cursoId, roster, opciones) {
	const ids = roster.map((a) => a.id);
	if (ids.length === 0) return {
		filas: [],
		hayVotacion: false
	};
	const hoy = /* @__PURE__ */ new Date();
	const hace30 = /* @__PURE__ */ new Date(hoy.getTime() - 30 * DIA);
	const hace60 = /* @__PURE__ */ new Date(hoy.getTime() - 60 * DIA);
	const hace90 = (/* @__PURE__ */ new Date(hoy.getTime() - 90 * DIA)).toISOString().slice(0, 10);
	const ciclo = inicioCiclo(hoy);
	const [falRows, amoRows, obsRows, social, notas] = await Promise.all([
		db.select({
			alumno: faltasAlumnos.alumnoMoodleId,
			fecha: faltas.fecha,
			tipo: faltas.tipo
		}).from(faltasAlumnos).innerJoin(faltas, eq(faltasAlumnos.faltaId, faltas.id)).where(inArray(faltasAlumnos.alumnoMoodleId, ids)),
		db.select({
			alumno: amonestaciones.alumnoMoodleId,
			fecha: amonestaciones.fecha,
			gravedad: amonestaciones.gravedad
		}).from(amonestaciones).where(inArray(amonestaciones.alumnoMoodleId, ids)),
		db.select({
			alumno: observaciones.alumnoMoodleId,
			fecha: observaciones.fecha,
			actitud: observaciones.actitud,
			participacion: observaciones.participacion,
			tarea: observaciones.tareaCompleta
		}).from(observaciones).where(inArray(observaciones.alumnoMoodleId, ids)),
		lecturaSocial(cursoId, roster),
		opciones.conNotas ? obtenerNotasMoodle(cursoId, ids) : Promise.resolve(null)
	]);
	const prom = (xs) => xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length * 10) / 10 : null;
	const ultima = social[social.length - 1];
	const filas = roster.map((a) => {
		const f = falRows.filter((x) => x.alumno === a.id);
		const aus = f.filter((x) => x.tipo === "ausente");
		const am = amoRows.filter((x) => x.alumno === a.id && aFecha(x.fecha) >= hace60);
		const ob = obsRows.filter((x) => x.alumno === a.id && x.fecha >= hace90);
		const tareas = ob.map((x) => x.tarea).filter((t) => t != null);
		const m = ultima?.metricas.get(a.id);
		const vecesAcomp = social.slice(-3).filter((l) => l.acomp.has(a.id)).length;
		return evaluarAlumno({
			id: a.id,
			nombre: a.nombre,
			ausenciasRecientes: aus.filter((x) => aFecha(x.fecha) >= hace30).length,
			ausenciasCiclo: aus.filter((x) => aFecha(x.fecha) >= ciclo).length,
			retrasosRecientes: f.filter((x) => x.tipo === "retraso" && aFecha(x.fecha) >= hace30).length,
			amonestaciones: {
				leve: am.filter((x) => x.gravedad === "leve").length,
				mediana: am.filter((x) => x.gravedad === "mediana").length,
				grave: am.filter((x) => x.gravedad === "grave").length
			},
			actitud: prom(ob.map((x) => x.actitud).filter((n) => n != null)),
			participacion: prom(ob.map((x) => x.participacion).filter((n) => n != null)),
			tareasOk: tareas.length ? Math.round(tareas.filter(Boolean).length / tareas.length * 100) : null,
			nota: notas ? notas.get(a.id) ?? null : void 0,
			social: m ? {
				recibidas: m.recibidas,
				exposicion: m.exposicion,
				acompanar: ultima.acomp.has(a.id),
				sostenida: vecesAcomp >= 2
			} : null
		});
	});
	filas.sort((x, y) => y.puntos - x.puntos || x.nombre.localeCompare(y.nombre, "es"));
	return {
		filas,
		hayVotacion: social.length > 0
	};
}

export { resumenTablero as a, crearCaso as b, casoAbiertoDe as c, agregarIntervencion as d, actualizarCaso as e, listarEquipoGabinete as f, alertaDelCurso as g, casosAbiertosPorAlumno as h, listarCasos as l, obtenerCaso as o, registrarDerivacion as r };
//# sourceMappingURL=gabinete-BUkdUbGK.js.map
