import { r as registrarAccion, i as ipDe } from './audit-DcTc3_qL.js';
import { a as listarCursos, b as listarAlumnosDeCurso } from './cursos2-BTSWVjNq.js';
import { e as exigirStaff } from './acceso-CC5WrM6x.js';
import { r as registrarDerivacion } from './gabinete-BUkdUbGK.js';
import { fail } from '@sveltejs/kit';
import './db-DnDhVbjt.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './client-CURRDhAR.js';
import 'drizzle-orm';
import './authz-C2Zplj7X.js';
import './agrupamientos-DwaMuOx0.js';
import 'node:crypto';
import './perfilAlumnos-LVNftgNy.js';
import './guia-Cz0z5vQo.js';

//#region src/routes/derivar/+page.server.ts
var load = async ({ locals, url }) => {
	await exigirStaff(locals.usuario);
	const cursos = (await listarCursos().catch(() => [])).map((c) => ({
		id: c.id,
		nombre: c.displayname || c.fullname
	}));
	const cursoId = Number(url.searchParams.get("curso"));
	const alumnos = Number.isInteger(cursoId) && cursoId > 0 ? (await listarAlumnosDeCurso(cursoId).catch(() => [])).map((u) => ({
		id: u.id,
		nombre: u.fullname
	})) : [];
	const alumnoId = Number(url.searchParams.get("alumno"));
	return {
		cursos,
		cursoId: alumnos.length ? cursoId : null,
		alumnos,
		alumnoId: alumnos.some((a) => a.id === alumnoId) ? alumnoId : null
	};
};
var actions = { default: async ({ request, locals }) => {
	const usuarioId = await exigirStaff(locals.usuario);
	const fd = await request.formData();
	const cursoId = Number(fd.get("cursoId"));
	const alumnoId = Number(fd.get("alumnoId"));
	const queObservo = String(fd.get("queObservo") ?? "").trim().slice(0, 3e3);
	const desdeCuando = String(fd.get("desdeCuando") ?? "").trim().slice(0, 300);
	const queSeHizo = String(fd.get("queSeHizo") ?? "").trim().slice(0, 2e3);
	const fortalezas = String(fd.get("fortalezas") ?? "").trim().slice(0, 2e3) || null;
	if (!queObservo) return fail(400, { error: "Contá qué observaste." });
	const curso = (await listarCursos().catch(() => [])).find((c) => c.id === cursoId);
	const alumno = (curso ? await listarAlumnosDeCurso(cursoId).catch(() => []) : []).find((a) => a.id === alumnoId);
	if (!curso || !alumno) return fail(400, { error: "Elegí el curso y el alumno." });
	const motivo = [
		`Qué se observó: ${queObservo}`,
		desdeCuando ? `Desde cuándo: ${desdeCuando}` : "",
		queSeHizo ? `Qué se intentó en el aula: ${queSeHizo}` : ""
	].filter(Boolean).join("\n");
	const { casoId } = await registrarDerivacion({
		alumnoMoodleId: alumno.id,
		alumnoNombre: alumno.fullname,
		cursoMoodleId: cursoId,
		cursoNombre: curso.displayname || curso.fullname,
		motivo,
		fortalezas,
		derivadoPor: usuarioId
	});
	await registrarAccion({
		usuarioId,
		accion: "gabinete.derivar",
		tablaDestino: "gabinete_casos",
		idDestino: casoId,
		ip: ipDe(request)
	});
	return { ok: `Derivación de ${alumno.fullname} enviada al gabinete. Gracias: el equipo se va a contactar con vos.` };
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 26;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BnGOFzIb.js')).default;
const server_id = "src/routes/derivar/+page.server.ts";
const imports = ["_app/immutable/nodes/26.-61JxjDI.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/BpBdz8fz.js","_app/immutable/chunks/BI88GkAg.js","_app/immutable/chunks/BrKMbrgq.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=26-DjvJnkMo.js.map
