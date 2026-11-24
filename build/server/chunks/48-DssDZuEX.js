import { b as listarAlumnosDeCurso, a as listarCursos } from './cursos2-BuIc_Cww.js';
import { N as agrupacionesDelCurso, l as listarSesionesDelCurso, g as listarVotos, f as modoDe, D as agruparAlAzar, i as construirGrafo } from './agrupamientos-Dx_h0nb5.js';
import { p as planoVigente, a as parseBancos } from './aula-CN0MUuvc.js';
import { v as veTodasLasSesiones } from './authz-DQJuia-E.js';
import { e as exigirStaff } from './acceso2-XBo-WmRi.js';
import { error } from '@sveltejs/kit';
import './client-txz_W3Xb.js';
import './db-D7hI4G6x.js';
import './index.js-D6_LEqEo.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'node:crypto';

// src/routes/pizarra/[cursoId]/+page.server.ts
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
const component = async () => component_cache ??= (await import('./_page.svelte-GYU5u2_l.js')).default;
const server_id = "src/routes/pizarra/[cursoId]/+page.server.ts";
const imports = ["_app/immutable/nodes/48.C7bFPWlS.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js","_app/immutable/chunks/DeF1vw6K.js","_app/immutable/chunks/C88JlKnk.js","_app/immutable/chunks/C0D3a8lr.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=48-DssDZuEX.js.map
