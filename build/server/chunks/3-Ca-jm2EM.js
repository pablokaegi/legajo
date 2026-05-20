import { d as db, s as syncLogs } from './db-XKMgjins.js';
import { m as moodle } from './client-B-Jh6LXU.js';
import { l as listarCursos } from './cursos-KiCjooEC.js';
import { redirect } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';

//#region src/routes/+page.server.ts
var load = async ({ locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const [moodleResult, logsResult, cursosResult] = await Promise.allSettled([
		moodle.getSiteInfo(),
		db.select().from(syncLogs).orderBy(desc(syncLogs.createdAt)).limit(5),
		listarCursos()
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
	const logs = logsResult.status === "fulfilled" ? logsResult.value : [];
	const totalCursos = cursosResult.status === "fulfilled" ? cursosResult.value.length : 0;
	return {
		usuario: locals.usuario,
		moodleStatus,
		totalCursos,
		logs
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-ClhlhY6g.js')).default;
const server_id = "src/routes/+page.server.ts";
const imports = ["_app/immutable/nodes/3.vr69yXkz.js","_app/immutable/chunks/BCmZRGrY.js","_app/immutable/chunks/2TU3FloQ.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=3-Ca-jm2EM.js.map
