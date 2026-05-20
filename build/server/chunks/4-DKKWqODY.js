import { m as moodle } from './client-BGsR3K7T.js';
import { l as listarCursos } from './cursos2-BbLts006.js';
import { redirect } from '@sveltejs/kit';
import './shared-server-asDUS7ug.js';
import './db-jloi_eIm.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/+page.server.ts
var load = async ({ locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const [moodleResult, cursosResult] = await Promise.allSettled([moodle.getSiteInfo(), listarCursos()]);
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
		totalCursos
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 4;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CtRKzoFm.js')).default;
const server_id = "src/routes/+page.server.ts";
const imports = ["_app/immutable/nodes/4.Co6IvxnR.js","_app/immutable/chunks/uSN3y40e.js","_app/immutable/chunks/B8WnZMYa.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=4-DKKWqODY.js.map
