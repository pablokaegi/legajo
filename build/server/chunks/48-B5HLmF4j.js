import { p as private_env } from './shared-server-asDUS7ug.js';
import { r as puedeEvaluarCurso } from './authz-BVdVv-6k.js';
import { r as registrarAccion } from './audit-Dz9I-BN1.js';
import { a as aulaPilotoHabilitada } from './aulaPiloto-DLB6Zm9h.js';
import { e as esquemaLibro, l as libroCiencias, E as ErrorLibro, a as actividadCiencias } from './libro-ciencias-B_zFdv1Z.js';
import { fail, error, redirect } from '@sveltejs/kit';
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
import './apoyos-DDSemfdS.js';
import 'node:child_process';

//#region src/routes/laboratorio/apoyos/libro/+page.server.ts
async function acceso(locals) {
	if (!aulaPilotoHabilitada()) error(404, "El editor está disponible en el laboratorio de prueba.");
	if (!locals.usuario) redirect(303, "/auth?redirect=%2Flaboratorio%2Fapoyos%2Flibro");
	const curso = Number(private_env.MOODLE_AULA_CURSO_ID);
	if (!Number.isSafeInteger(curso) || curso <= 0) error(503, "Falta configurar el curso de Ciencias.");
	const usuarioId = locals.usuario.usuarioId;
	if (!await puedeEvaluarCurso(usuarioId, curso)) error(403, "El curso de Ciencias no está asignado a tu cuenta docente.");
	return usuarioId;
}
var load = async ({ locals, setHeaders }) => {
	await acceso(locals);
	setHeaders({ "cache-control": "private, no-store" });
	try {
		const libro = await libroCiencias(private_env).leer();
		return {
			revision: libro.revision,
			url: libro.url,
			actividad: libro.actividad ?? actividadCiencias()
		};
	} catch (err) {
		if (err instanceof ErrorLibro) error(err.status, err.message);
		error(503, "No se pudo leer el Libro de Ciencias. Revisá la conexión con Moodle y su servicio de publicación.");
	}
};
var actions = { publicar: async ({ locals, request }) => {
	const usuarioId = await acceso(locals);
	const form = await request.formData();
	const ids = form.getAll("pasoId");
	const titulos = form.getAll("pasoTitulo");
	const consignas = form.getAll("pasoConsigna");
	const audios = form.getAll("pasoAudio");
	if (![
		titulos,
		consignas,
		audios
	].every((valores) => valores.length === ids.length)) return fail(400, { error: "Revisá los campos de cada paso." });
	const actividad = esquemaLibro.safeParse({
		titulo: form.get("titulo"),
		objetivo: form.get("objetivo"),
		pasos: ids.map((id, i) => ({
			id,
			titulo: titulos[i],
			consigna: consignas[i],
			audio: audios[i]
		}))
	});
	const revisionFormulario = form.get("revision");
	const revision = Number(revisionFormulario);
	if (!actividad.success || typeof revisionFormulario !== "string" || !/^\d+$/.test(revisionFormulario) || !Number.isSafeInteger(revision)) return fail(400, { error: "Completá el título, el objetivo y la consigna de cada paso. Revisá que haya entre uno y ocho pasos." });
	const borrador = {
		actividad: actividad.data,
		revision
	};
	if (form.get("confirmar") !== "si") return fail(400, {
		error: "Confirmá la publicación para el curso.",
		borrador
	});
	try {
		const resultado = await libroCiencias(private_env).publicar(actividad.data, revision);
		if (resultado.cambio) await registrarAccion({
			usuarioId,
			accion: "aula_libro_publicar",
			tablaDestino: "moodle_book",
			idDestino: resultado.cmid,
			payload: { revision: resultado.revision }
		});
		return { resultado };
	} catch (err) {
		if (err instanceof ErrorLibro) return fail(err.status, {
			error: err.message,
			borrador
		});
		return fail(503, {
			error: "No se pudo verificar el Libro en Moodle. Tus cambios siguen en el editor.",
			borrador
		});
	}
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 48;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-C1gEM_ga.js')).default;
const server_id = "src/routes/laboratorio/apoyos/libro/+page.server.ts";
const imports = ["_app/immutable/nodes/48.DjQqAZAV.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/B8RcQQp0.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/M6KOCQrT.js","_app/immutable/chunks/DymAb4Hh.js","_app/immutable/chunks/xDlSgPMc.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=48-B5HLmF4j.js.map
