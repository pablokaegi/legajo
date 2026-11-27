import { p as private_env } from './shared-server-asDUS7ug.js';
import { n as cursosVisiblesPara, r as puedeEvaluarCurso, s as puedeGestionarFichaApoyo } from './authz-BVdVv-6k.js';
import { m as moodle } from './client-Dsrb4zGp.js';
import { a as listarCursos } from './cursos2-pDrqIz-A.js';
import { a as aulaPilotoHabilitada } from './aulaPiloto-DLB6Zm9h.js';
import { redirect } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './rest-qugARKMk.js';

//#region src/routes/+page.server.ts
var load = async ({ locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const usuarioId = locals.usuario.usuarioId;
	const cursoAula = Number(private_env.MOODLE_AULA_CURSO_ID);
	const piloto = aulaPilotoHabilitada();
	const [moodleResult, cursosResult, aulaResult, fichasResult] = await Promise.allSettled([
		moodle.getSiteInfo(),
		listarCursos().then((cursos) => cursosVisiblesPara(usuarioId, cursos)),
		piloto ? puedeEvaluarCurso(usuarioId, cursoAula) : false,
		piloto ? puedeGestionarFichaApoyo(usuarioId, cursoAula) : false
	]);
	let moodleStatus;
	if (moodleResult.status === "fulfilled") {
		const info = moodleResult.value;
		moodleStatus = {
			ok: true,
			mensaje: `Conectado como ${info.username}`,
			sitename: info.sitename,
			funciones: info.functions.map((f) => f.name)
		};
	} else moodleStatus = {
		ok: false,
		mensaje: moodleResult.reason instanceof Error ? moodleResult.reason.message : "Error desconocido"
	};
	const totalCursos = cursosResult.status === "fulfilled" ? cursosResult.value.length : 0;
	return {
		usuario: locals.usuario,
		moodleStatus,
		totalCursos,
		aulaOralDisponible: aulaResult.status === "fulfilled" && aulaResult.value,
		apoyosDisponibles: fichasResult.status === "fulfilled" && fichasResult.value
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 8;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DW8f75el.js')).default;
const server_id = "src/routes/+page.server.ts";
const imports = ["_app/immutable/nodes/8.h1Jt_foX.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=8-CJmg5VsN.js.map
