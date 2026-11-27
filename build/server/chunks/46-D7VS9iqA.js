import { p as private_env } from './shared-server-asDUS7ug.js';
import { e as esStaff, s as puedeGestionarFichaApoyo, r as puedeEvaluarCurso } from './authz-BVdVv-6k.js';
import { a as aulaPilotoHabilitada } from './aulaPiloto-DLB6Zm9h.js';
import { redirect, error } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/laboratorio/apoyos/+page.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) redirect(303, `/auth?redirect=${encodeURIComponent(url.pathname)}`);
	if (!await esStaff(locals.usuario.usuarioId)) error(403, "El Laboratorio de apoyos es para el personal autorizado.");
	const curso = Number(private_env.MOODLE_AULA_CURSO_ID);
	if (!aulaPilotoHabilitada() || !Number.isSafeInteger(curso) || curso <= 0) return {
		fichas: false,
		libro: false
	};
	const usuario = locals.usuario.usuarioId;
	const [fichas, libro] = await Promise.all([puedeGestionarFichaApoyo(usuario, curso), private_env.MOODLE_AULA_LIBRO_TOKEN?.trim() ? puedeEvaluarCurso(usuario, curso) : false]);
	return {
		fichas,
		libro
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 46;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BRxW1JXa.js')).default;
const server_id = "src/routes/laboratorio/apoyos/+page.server.ts";
const imports = ["_app/immutable/nodes/46.CIyQe8Jg.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js","_app/immutable/chunks/xDlSgPMc.js"];
const stylesheets = ["_app/immutable/assets/46.BUnVIvNF.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=46-D7VS9iqA.js.map
