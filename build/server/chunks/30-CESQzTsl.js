import { p as private_env } from './shared-server-asDUS7ug.js';
import { y as puedeVerEvidenciasDeGabinete } from './authz-BVdVv-6k.js';
import { e as exigirGabinete } from './acceso-mvVGKflq.js';
import { d as destinoCuestionarioCiencias } from './aulaPiloto-DLB6Zm9h.js';
import { l as leerCuestionarioCiencias } from './cuestionario-ciencias-ARB6kiZV.js';
import { error } from '@sveltejs/kit';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './aula-rest-Gaa3l_kU.js';
import './rest-qugARKMk.js';
import 'zod';

//#region src/routes/gabinete/aula-ciencias/+page.server.ts
var load = async ({ locals, setHeaders }) => {
	setHeaders({ "cache-control": "private, no-store" });
	const usuarioId = await exigirGabinete(locals.usuario);
	const destino = destinoCuestionarioCiencias();
	if (!destino) error(404, "El cuestionario de Ciencias no está configurado en el piloto.");
	if (!await puedeVerEvidenciasDeGabinete(usuarioId, destino.cursoId)) error(403, "El curso de Ciencias está fuera de tu alcance de gabinete.");
	try {
		return await leerCuestionarioCiencias(private_env, destino.quizId);
	} catch {
		error(503, "No se pudo consultar el cuestionario o su padrón. Revisá el Moodle de prueba y volvé a intentar.");
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 30;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-C-5VcDq9.js')).default;
const server_id = "src/routes/gabinete/aula-ciencias/+page.server.ts";
const imports = ["_app/immutable/nodes/30.BIxeEdlA.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=30-CESQzTsl.js.map
