import { p as puedeVerCurso, v as veTodasLasSesionesDeCurso } from './authz-BVdVv-6k.js';
import { b as listarAlumnosDeCurso, a as listarCursos } from './cursos2-pDrqIz-A.js';
import { N as agrupacionesDelCurso, l as listarSesionesDelCurso, g as listarVotos, f as modoDe, D as agruparAlAzar, i as construirGrafo } from './agrupamientos-f9JamgYJ.js';
import { e as exigirStaff } from './acceso2-CDk--U70.js';
import { p as planoVigente, a as parseBancos } from './aula-3UKAWgDU.js';
import { error } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './client-Dsrb4zGp.js';
import './rest-qugARKMk.js';
import 'node:crypto';

//#region src/routes/pizarra/[cursoId]/+page.server.ts
var load = async ({ locals, params, url }) => {
	const usuarioId = await exigirStaff(locals.usuario);
	const cursoId = Number(params.cursoId);
	if (!Number.isInteger(cursoId) || cursoId <= 0) error(400, "Curso inválido");
	if (!await puedeVerCurso(usuarioId, cursoId)) error(403, "No tenés acceso a este curso.");
	const [rosterMoodle, cursos, verTodas] = await Promise.all([
		listarAlumnosDeCurso(cursoId).catch(() => []),
		listarCursos().catch(() => []),
		veTodasLasSesionesDeCurso(usuarioId, cursoId)
	]);
	const roster = rosterMoodle.map((u) => ({
		id: u.id,
		nombre: u.fullname
	})).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
	const curso = cursos.find((c) => c.id === cursoId);
	const [plano, agrupaciones] = await Promise.all([planoVigente(cursoId), agrupacionesDelCurso(cursoId, {
		usuarioId,
		verTodas
	})]);
	const n = Number(url.searchParams.get("azar"));
	let azar = null;
	if ([
		2,
		3,
		4,
		5,
		6
	].includes(n) && roster.length > 1) {
		const sesiones = (await listarSesionesDelCurso(cursoId)).filter((s) => verTodas || s.createdBy === usuarioId).reverse();
		const ids = new Set(roster.map((a) => a.id));
		let votos = [];
		let modo = "nominacion";
		for (const s of sesiones) {
			votos = (await listarVotos(s.id)).filter((v) => ids.has(v.votanteMoodleId));
			if (votos.length) {
				modo = modoDe(s);
				break;
			}
		}
		const semilla = Number(url.searchParams.get("semilla")) || Date.now() % 1e9;
		azar = agruparAlAzar(construirGrafo(votos, roster, modo), n, semilla);
	}
	return {
		cursoId,
		cursoNombre: curso ? curso.displayname || curso.fullname : `Curso ${cursoId}`,
		roster,
		plano: plano ? {
			nombre: plano.nombre,
			columnas: plano.columnas,
			bancos: parseBancos(plano.bancosJson)
		} : null,
		agrupaciones,
		azar,
		azarTamano: azar ? n : null
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 52;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CfuQPkKl.js')).default;
const server_id = "src/routes/pizarra/[cursoId]/+page.server.ts";
const imports = ["_app/immutable/nodes/52.BKpG5Q0r.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/M6KOCQrT.js","_app/immutable/chunks/4WnCJOoR.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=52-CEcOiYry.js.map
