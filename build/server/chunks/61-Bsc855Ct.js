import { a as esDirectivoOAdmin, j as alcancePreceptoria } from './authz-BVdVv-6k.js';
import { b as listarAlumnosDeCurso } from './cursos2-pDrqIz-A.js';
import { M as obtenerHistorialAgrupamientosDeAlumno } from './agrupamientos-f9JamgYJ.js';
import { o as obtenerLegajoAlumno } from './legajo-B-_0HiSq.js';
import { redirect, error } from '@sveltejs/kit';
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

//#region src/routes/preceptor/legajo/[alumnoId]/+page.server.ts
var load = async ({ locals, params, url }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	const alumnoMoodleId = Number(params.alumnoId);
	if (!Number.isSafeInteger(alumnoMoodleId) || alumnoMoodleId <= 0) error(400, "ID inválido");
	const usuarioId = locals.usuario.usuarioId;
	const [verTodas, cursosPermitidos] = await Promise.all([esDirectivoOAdmin(usuarioId), alcancePreceptoria(usuarioId)]);
	if (cursosPermitidos) {
		const curso = Number(url.searchParams.get("curso"));
		const aConsultar = curso ? cursosPermitidos.filter((id) => id === curso) : cursosPermitidos;
		if (!aConsultar.length) error(403, "No tenés acceso a este legajo.");
		const padrones = await Promise.allSettled(aConsultar.map(listarAlumnosDeCurso));
		if (!padrones.some((r) => r.status === "fulfilled" && r.value.some((a) => a.id === alumnoMoodleId))) {
			if (padrones.some((r) => r.status === "rejected")) error(503, "No se pudo verificar la matrícula en Moodle.");
			error(403, "No tenés acceso a este legajo.");
		}
	}
	const [legajo, agrupamientos] = await Promise.all([obtenerLegajoAlumno(alumnoMoodleId, {
		usuarioId,
		verTodas,
		cursosPermitidos
	}), obtenerHistorialAgrupamientosDeAlumno(alumnoMoodleId, cursosPermitidos).catch(() => [])]);
	return {
		legajo,
		agrupamientos
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 61;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BbKdQULQ.js')).default;
const server_id = "src/routes/preceptor/legajo/[alumnoId]/+page.server.ts";
const imports = ["_app/immutable/nodes/61.B8OzcPwa.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=61-Bsc855Ct.js.map
