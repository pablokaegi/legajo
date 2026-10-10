import { a as esDirectivoOAdmin } from './authz-BOxGka1D.js';
import { a as listarCursos, b as listarAlumnosDeCurso } from './cursos2-B5YEKkXD.js';
import { i as construirGrafo, f as modoDe, g as listarVotos, h as analizarRelacionesSociales, D as agruparAlAzar, o as obtenerSesion, l as listarSesionesDelCurso } from './agrupamientos-C51657gi.js';
import { e as exigirStaff } from './acceso2-DC8bIya7.js';
import { a as generarUbicacion } from './ubicacion-Casxh0QO.js';
import { o as obtenerPlano, e as eliminarPlano, m as marcarVigente, g as guardarPlano, l as listarPlanos, p as planoVigente, a as parseBancos } from './aula-CacsvPHG.js';
import { fail, error } from '@sveltejs/kit';
import './db-DeyHlLbL.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './client-uxwLBcGc.js';
import 'node:crypto';

//#region src/routes/aula/[cursoId]/+page.server.ts
var ORIGENES = new Set([
	"inclusiva",
	"aleatorio",
	"alfabetico",
	"manual"
]);
function cursoDe(param) {
	const id = Number(param);
	if (!Number.isInteger(id) || id <= 0) error(400, "Curso inválido");
	return id;
}
async function rosterDe(id) {
	return (await listarAlumnosDeCurso(id).catch(() => [])).map((u) => ({
		id: u.id,
		nombre: u.fullname
	})).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
var enPares = (alumnos) => {
	const bancos = [];
	for (let i = 0; i < alumnos.length; i += 2) bancos.push([alumnos[i], alumnos[i + 1] ?? null]);
	return bancos;
};
/** Sesión por nominación a usar: la indicada (si es del curso) o la última con votos. */
async function sesionParaCurso(cursoId, sesionParam) {
	if (sesionParam) {
		const s = await obtenerSesion(sesionParam);
		if (s && s.cursoMoodleId === cursoId) return s;
	}
	const sesiones = (await listarSesionesDelCurso(cursoId)).filter((s) => modoDe(s) === "nominacion");
	for (const s of sesiones.reverse()) if ((await listarVotos(s.id)).length > 0) return s;
	return null;
}
var load = async ({ locals, params, url }) => {
	const usuarioId = await exigirStaff(locals.usuario);
	const cursoId = cursoDe(params.cursoId);
	const [roster, planos, cursos] = await Promise.all([
		rosterDe(cursoId),
		listarPlanos(cursoId),
		listarCursos().catch(() => [])
	]);
	const curso = cursos.find((c) => c.id === cursoId);
	const cursoNombre = curso ? curso.displayname || curso.fullname : planos[0]?.cursoNombre ?? `Curso ${cursoId}`;
	const colRaw = Number(url.searchParams.get("columnas"));
	const propuesta = url.searchParams.get("propuesta");
	const planoId = Number(url.searchParams.get("plano"));
	let actual = null;
	if (propuesta && ORIGENES.has(propuesta) && roster.length > 0) {
		const columnas = [
			2,
			3,
			4
		].includes(colRaw) ? colRaw : 3;
		const sesion = await sesionParaCurso(cursoId, Number(url.searchParams.get("sesion")) || null);
		const grafo = construirGrafo(sesion ? await listarVotos(sesion.id) : [], roster, sesion ? modoDe(sesion) : "nominacion");
		let bancos;
		let nota;
		if (propuesta === "inclusiva") if (sesion) {
			bancos = generarUbicacion(grafo, analizarRelacionesSociales(grafo)).map((b) => b.asientos);
			nota = `Según la votación "${sesion.titulo}".`;
		} else {
			bancos = enPares(roster);
			nota = "No hay votación por nominación de este curso: se usó el orden alfabético.";
		}
		else if (propuesta === "aleatorio") {
			bancos = agruparAlAzar(grafo, 2, Date.now() % 1e9);
			nota = sesion ? "Al azar, respetando los pedidos de no quedar juntos." : "Al azar.";
		} else bancos = enPares(roster);
		actual = {
			id: null,
			nombre: "",
			columnas,
			bancos,
			origen: propuesta,
			vigente: false,
			sesionId: sesion?.id ?? null,
			createdAt: null,
			nota
		};
	} else {
		const p = Number.isInteger(planoId) && planoId > 0 ? await obtenerPlano(cursoId, planoId) : await planoVigente(cursoId);
		if (p) actual = {
			id: p.id,
			nombre: p.nombre,
			columnas: p.columnas,
			bancos: parseBancos(p.bancosJson),
			origen: p.origen,
			vigente: p.vigente,
			sesionId: p.sesionId,
			createdAt: p.createdAt
		};
	}
	const puedeBorrarTodo = await esDirectivoOAdmin(usuarioId);
	return {
		cursoId,
		cursoNombre,
		roster,
		actual,
		esPropuesta: actual != null && actual.id == null,
		planos: planos.map((p) => ({
			id: p.id,
			nombre: p.nombre,
			origen: p.origen,
			vigente: p.vigente,
			createdAt: p.createdAt,
			puedeBorrar: puedeBorrarTodo || p.createdBy === usuarioId
		}))
	};
};
var actions = {
	guardar: async ({ request, locals, params }) => {
		const usuarioId = await exigirStaff(locals.usuario);
		const cursoId = cursoDe(params.cursoId);
		const fd = await request.formData();
		const nombre = String(fd.get("nombre") ?? "").trim().slice(0, 200) || `Plano ${(/* @__PURE__ */ new Date()).toLocaleDateString("es-AR")}`;
		const columnas = Math.max(1, Math.min(6, Number(fd.get("columnas")) || 3));
		const origenRaw = String(fd.get("origen") ?? "manual");
		const origen = ORIGENES.has(origenRaw) ? origenRaw : "manual";
		const sesionId = Number(fd.get("sesionId")) || null;
		const roster = await rosterDe(cursoId);
		if (roster.length === 0) return fail(503, { error: "No se pudo obtener la lista del curso." });
		const porId = new Map(roster.map((a) => [a.id, a]));
		let bancos = [];
		try {
			const parsed = JSON.parse(String(fd.get("bancosJson") ?? "[]"));
			if (!Array.isArray(parsed) || parsed.length > 60) return fail(400, { error: "Plano inválido." });
			const usados = /* @__PURE__ */ new Set();
			for (const b of parsed) {
				if (!Array.isArray(b) || b.length === 0 || b.length > 3) return fail(400, { error: "Plano inválido." });
				bancos.push(b.map((s) => {
					if (s == null) return null;
					const a = porId.get(Number(s.id));
					if (!a || usados.has(a.id)) return null;
					usados.add(a.id);
					return a;
				}));
			}
		} catch {
			return fail(400, { error: "Plano inválido." });
		}
		if (!bancos.some((b) => b.some((s) => s != null))) return fail(400, { error: "El plano está vacío." });
		const curso = (await listarCursos().catch(() => [])).find((c) => c.id === cursoId);
		await guardarPlano({
			cursoMoodleId: cursoId,
			cursoNombre: curso ? curso.displayname || curso.fullname : `Curso ${cursoId}`,
			nombre,
			columnas,
			bancos,
			origen,
			sesionId,
			createdBy: usuarioId
		});
		return { ok: "Plano guardado como vigente." };
	},
	vigente: async ({ request, locals, params }) => {
		await exigirStaff(locals.usuario);
		const cursoId = cursoDe(params.cursoId);
		const id = Number((await request.formData()).get("planoId"));
		if (!await obtenerPlano(cursoId, id)) return fail(404, { error: "Plano no encontrado." });
		await marcarVigente(cursoId, id);
		return { ok: "Plano marcado como vigente." };
	},
	eliminar: async ({ request, locals, params }) => {
		const usuarioId = await exigirStaff(locals.usuario);
		const cursoId = cursoDe(params.cursoId);
		const id = Number((await request.formData()).get("planoId"));
		const p = await obtenerPlano(cursoId, id);
		if (!p) return fail(404, { error: "Plano no encontrado." });
		if (p.createdBy !== usuarioId && !await esDirectivoOAdmin(usuarioId)) return fail(403, { error: "Solo quien lo creó o dirección pueden borrarlo." });
		await eliminarPlano(cursoId, id);
		return { ok: "Plano eliminado." };
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 20;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CQyPUH9X.js')).default;
const server_id = "src/routes/aula/[cursoId]/+page.server.ts";
const imports = ["_app/immutable/nodes/20.B7aCiKcw.js","_app/immutable/chunks/BUJoxPBc.js","_app/immutable/chunks/3l6Q5lPp.js","_app/immutable/chunks/BFfF0FqC.js","_app/immutable/chunks/D-v2tPeI.js","_app/immutable/chunks/C8H49NTu.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=20-BDsS6mfl.js.map
