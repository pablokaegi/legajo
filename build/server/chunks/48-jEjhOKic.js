import { v as veTodasLasSesiones } from './authz-_wL7Hkka.js';
import { b as listarAlumnosDeCurso, a as listarCursos } from './cursos2-COBKiQyR.js';
import { N as agrupacionesDelCurso, l as listarSesionesDelCurso, g as listarVotos, f as modoDe, D as agruparAlAzar, i as construirGrafo } from './agrupamientos-DefKf2yH.js';
import { e as exigirStaff } from './acceso2-BashTpDd.js';
import { p as planoVigente, a as parseBancos } from './aula-CVUofAaf.js';
import { error } from '@sveltejs/kit';
import './db-jrdBeEUG.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './client-BlwuPSaS.js';
import 'node:crypto';

//#region src/routes/pizarra/[cursoId]/+page.server.ts
var load = async ({ locals, params, url }) => {
	const usuarioId = await exigirStaff(locals.usuario);
	const cursoId = Number(params.cursoId);
	if (!Number.isInteger(cursoId) || cursoId <= 0) error(400, "Curso inválido");
	const [rosterMoodle, cursos, verTodas] = await Promise.all([
		listarAlumnosDeCurso(cursoId).catch(() => []),
		listarCursos().catch(() => []),
		veTodasLasSesiones(usuarioId)
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
		const sesiones = (await listarSesionesDelCurso(cursoId)).reverse();
		let votos = [];
		let modo = "nominacion";
		for (const s of sesiones) {
			votos = await listarVotos(s.id);
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

const index = 48;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-ogLd4rQs.js')).default;
const server_id = "src/routes/pizarra/[cursoId]/+page.server.ts";
const imports = ["_app/immutable/nodes/48.CjLUZIY1.js","_app/immutable/chunks/CcZ_XLq7.js","_app/immutable/chunks/BucuNVqd.js","_app/immutable/chunks/BjkzJqKW.js","_app/immutable/chunks/Dcis9sER.js","_app/immutable/chunks/6xwAJV1g.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=48-jEjhOKic.js.map
