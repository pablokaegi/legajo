import { r as registrarAccion, i as ipDe } from './audit-DcTc3_qL.js';
import { e as exigirGabinete } from './acceso2-BZbylWqk.js';
import { T as TIPO_IDS, f as fechaMasDias, D as DIAS_REVISION, a as ESTADO_IDS, G as GUIA_POR_NIVEL, b as TIPOS_INTERVENCION, E as ESTADOS_CASO } from './guia-Cz0z5vQo.js';
import { o as obtenerCaso, d as agregarIntervencion, e as actualizarCaso, f as listarEquipoGabinete } from './gabinete-BUkdUbGK.js';
import { fail, error } from '@sveltejs/kit';
import './db-DnDhVbjt.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './authz-C2Zplj7X.js';
import 'drizzle-orm';
import './agrupamientos-DwaMuOx0.js';
import 'node:crypto';
import './perfilAlumnos-LVNftgNy.js';
import './client-CURRDhAR.js';

//#region src/routes/gabinete/casos/[id]/+page.server.ts
var FECHA = /^\d{4}-\d{2}-\d{2}$/;
function idDe(param) {
	const id = Number(param);
	if (!Number.isInteger(id) || id <= 0) error(400, "Caso inválido");
	return id;
}
var load = async ({ locals, params }) => {
	await exigirGabinete(locals.usuario);
	const caso = await obtenerCaso(idDe(params.id));
	if (!caso) error(404, "Caso no encontrado");
	return {
		...caso,
		equipo: await listarEquipoGabinete(),
		estados: ESTADOS_CASO,
		tipos: TIPOS_INTERVENCION,
		guia: GUIA_POR_NIVEL,
		hoy: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	};
};
var actions = {
	actualizar: async ({ request, locals, params }) => {
		const usuarioId = await exigirGabinete(locals.usuario);
		const id = idDe(params.id);
		const actual = await obtenerCaso(id);
		if (!actual) return fail(404, { error: "Caso no encontrado." });
		const fd = await request.formData();
		const estado = String(fd.get("estado") ?? "");
		const nivel = Number(fd.get("nivel"));
		const respRaw = String(fd.get("responsableId") ?? "");
		const revision = String(fd.get("proximaRevision") ?? "").trim();
		const motivo = String(fd.get("motivo") ?? "").trim().slice(0, 5e3);
		const fortalezas = String(fd.get("fortalezas") ?? "").trim().slice(0, 3e3) || null;
		if (!ESTADO_IDS.includes(estado)) return fail(400, { error: "Estado inválido." });
		if (![
			1,
			2,
			3
		].includes(nivel)) return fail(400, { error: "Nivel inválido." });
		if (revision && !FECHA.test(revision)) return fail(400, { error: "Fecha de revisión inválida." });
		if (!motivo) return fail(400, { error: "El motivo no puede quedar vacío." });
		const equipo = await listarEquipoGabinete();
		const responsableId = respRaw ? Number(respRaw) : null;
		if (responsableId != null && !equipo.some((p) => p.id === responsableId)) return fail(400, { error: "El responsable tiene que ser del gabinete." });
		await actualizarCaso(id, {
			estado,
			nivel,
			responsableId,
			proximaRevision: estado === "cerrado" ? null : revision || (nivel !== actual.caso.nivel ? fechaMasDias(DIAS_REVISION[nivel]) : actual.caso.proximaRevision),
			motivo,
			fortalezas
		});
		await registrarAccion({
			usuarioId,
			accion: "gabinete.caso.actualizar",
			tablaDestino: "gabinete_casos",
			idDestino: id,
			payload: {
				estado,
				nivel
			},
			ip: ipDe(request)
		});
		return { ok: "Caso actualizado." };
	},
	intervencion: async ({ request, locals, params }) => {
		const usuarioId = await exigirGabinete(locals.usuario);
		const id = idDe(params.id);
		const actual = await obtenerCaso(id);
		if (!actual) return fail(404, { error: "Caso no encontrado." });
		const fd = await request.formData();
		const tipo = String(fd.get("tipo") ?? "");
		const fecha = String(fd.get("fecha") ?? "");
		const descripcion = String(fd.get("descripcion") ?? "").trim().slice(0, 5e3);
		const acuerdos = String(fd.get("acuerdos") ?? "").trim().slice(0, 3e3) || null;
		const revision = String(fd.get("proximaRevision") ?? "").trim();
		if (!TIPO_IDS.includes(tipo)) return fail(400, { error: "Tipo de registro inválido." });
		if (!FECHA.test(fecha)) return fail(400, { error: "Fecha inválida." });
		if (!descripcion) return fail(400, { error: "Describí brevemente qué se hizo." });
		if (revision && !FECHA.test(revision)) return fail(400, { error: "Fecha de revisión inválida." });
		await agregarIntervencion({
			casoId: id,
			tipo,
			fecha,
			descripcion,
			acuerdos,
			autorId: usuarioId
		});
		const cambios = {};
		if (actual.caso.estado === "derivado") cambios.estado = "evaluacion";
		cambios.proximaRevision = revision || fechaMasDias(DIAS_REVISION[actual.caso.nivel] ?? 28);
		await actualizarCaso(id, cambios);
		await registrarAccion({
			usuarioId,
			accion: "gabinete.intervencion",
			tablaDestino: "gabinete_casos",
			idDestino: id,
			payload: { tipo },
			ip: ipDe(request)
		});
		return { ok: "Registro agregado." };
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 30;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-yXpxk3dd.js')).default;
const server_id = "src/routes/gabinete/casos/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/30.DKqiACyc.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/BI88GkAg.js","_app/immutable/chunks/BpBdz8fz.js","_app/immutable/chunks/BrKMbrgq.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=30-LA8uxC5B.js.map
