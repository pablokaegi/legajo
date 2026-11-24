import { m as moodle } from './client-txz_W3Xb.js';
import { a as listarCursos } from './cursos2-BuIc_Cww.js';
import { redirect } from '@sveltejs/kit';
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

// src/routes/+page.server.ts
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

const index = 8;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-LC0jdvE5.js')).default;
const server_id = "src/routes/+page.server.ts";
const imports = ["_app/immutable/nodes/8.maU39mYs.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=8-Bfodfh-T.js.map
