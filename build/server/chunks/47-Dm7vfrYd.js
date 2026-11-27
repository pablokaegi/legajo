import { p as private_env } from './shared-server-asDUS7ug.js';
import { d as db, E as fichasApoyo } from './db-CLN6I8p_.js';
import { y as puedeVerEvidenciasDeGabinete, s as puedeGestionarFichaApoyo } from './authz-BVdVv-6k.js';
import { r as registrarAccion } from './audit-Dz9I-BN1.js';
import { a as aulaPilotoHabilitada } from './aulaPiloto-DLB6Zm9h.js';
import { s as servicioMoodleDePrueba } from './aula-rest-Gaa3l_kU.js';
import { a as leerCuestionarioDeAlumno, o as objetivosCiencias } from './cuestionario-ciencias-ARB6kiZV.js';
import { a as apoyoSchema } from './apoyos-DDSemfdS.js';
import { l as libroCiencias } from './libro-ciencias-B_zFdv1Z.js';
import { fail, error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './rest-qugARKMk.js';
import 'node:child_process';

//#region src/lib/server/services/evidenciasFichaCiencias.ts
var pasosPorObjetivo = {
	"Calcula caudales": ["leer", "comparar"],
	"Compara caudales": ["comparar"],
	"Reconoce una comparación justa": ["justificar"]
};
function estadoDelObjetivo(puntaje, sinPuntaje) {
	if (puntaje === null) return sinPuntaje;
	if (puntaje === 1) return "Logrado en este intento";
	if (puntaje === 0) return "Sin puntaje en este intento";
	return "Logro parcial";
}
async function consultarLibro(entorno) {
	try {
		return await libroCiencias(entorno).leer();
	} catch {
		return null;
	}
}
async function leerEvidenciasFichaCiencias(entorno, cursoId, alumnoId) {
	if (!Number.isSafeInteger(cursoId) || cursoId <= 0 || cursoId !== Number(entorno.MOODLE_AULA_CURSO_ID)) throw new Error("El curso no corresponde al piloto de Ciencias.");
	const [libro, quiz] = await Promise.all([consultarLibro(entorno), leerCuestionarioDeAlumno(entorno, cursoId, alumnoId).catch(() => null)]);
	const ultimo = quiz?.intentos[0];
	const evaluado = quiz?.intentos.find((i) => i.puntajes?.some((p) => p !== null));
	const estado = !quiz || quiz.errorLectura ? "Lectura no disponible" : ultimo?.estado ?? "Sin intento";
	const sinPuntaje = evaluado || ultimo?.puntajes ? "Pendiente de corrección" : estado;
	return {
		libro: {
			titulo: libro?.actividad?.titulo ?? null,
			url: libro?.url ?? null,
			revision: libro?.revision || null,
			estado: !libro ? "Lectura no disponible" : libro.actividad ? "Publicado" : "Sin publicar"
		},
		cuestionario: {
			titulo: quiz?.titulo ?? null,
			url: quiz?.url ?? null,
			estado,
			intento: evaluado ? {
				numero: evaluado.numero,
				fecha: evaluado.fecha
			} : null,
			ultimo: ultimo ? {
				numero: ultimo.numero,
				estado: ultimo.estado
			} : null
		},
		objetivos: objetivosCiencias.map((nombre, indice) => {
			const puntaje = evaluado?.puntajes?.[indice] ?? null;
			const capitulos = (libro?.capitulos ?? []).filter((capitulo) => pasosPorObjetivo[nombre].includes(capitulo.id));
			return {
				nombre,
				puntaje,
				estado: estadoDelObjetivo(puntaje, sinPuntaje),
				capitulos: capitulos.map(({ titulo, url, audio }) => ({
					titulo,
					url,
					audio
				}))
			};
		})
	};
}
//#endregion
//#region src/lib/server/services/fichasApoyo.ts
var datosFichaApoyo = apoyoSchema.extend({
	barrera: z.string().trim().min(1, "Describí la barrera observada.").max(500),
	ajuste: z.string().trim().min(1, "Indicá el apoyo acordado.").max(500),
	responsable: z.string().trim().min(1, "Indicá quién acompaña al estudiante.").max(120),
	revision: z.string().date("Elegí una fecha de revisión válida.").min(10).refine((d) => d >= "1000-01-01", "Elegí una fecha de revisión válida."),
	observacion: z.string().trim().max(500)
});
var campos = datosFichaApoyo.keyof().options;
var destino = (cursoId, alumnoId) => and(eq(fichasApoyo.cursoMoodleId, cursoId), eq(fichasApoyo.alumnoMoodleId, alumnoId));
var ConflictoFichaApoyo = class extends Error {};
async function leerFichaApoyo(cursoId, alumnoId) {
	const [fila] = await db.select().from(fichasApoyo).where(destino(cursoId, alumnoId));
	if (!fila) return null;
	const { barrera, ajuste, responsable, revision, ofrecido, observacion, decision, version } = fila;
	return {
		barrera,
		ajuste,
		responsable,
		revision,
		ofrecido,
		observacion,
		decision,
		version
	};
}
async function guardarFichaApoyo(cursoId, alumnoId, autorId, version, contenido) {
	if (version === 0) try {
		const [alta] = await db.insert(fichasApoyo).values({
			...contenido,
			cursoMoodleId: cursoId,
			alumnoMoodleId: alumnoId,
			autorId
		});
		await registrarAccion({
			usuarioId: autorId,
			accion: "ficha_apoyo_crear",
			tablaDestino: "fichas_apoyo",
			idDestino: alta.insertId
		});
		return 1;
	} catch (err) {
		const causa = err;
		if (causa.code !== "ER_DUP_ENTRY" && causa.cause?.code !== "ER_DUP_ENTRY") throw err;
	}
	const condicion = destino(cursoId, alumnoId);
	const resultado = await db.transaction(async (tx) => {
		const [actual] = await tx.select().from(fichasApoyo).where(condicion).for("update");
		if (actual && campos.every((campo) => actual[campo] === contenido[campo])) return {
			version: actual.version,
			cambio: null
		};
		if (!actual || actual.version !== version) throw new ConflictoFichaApoyo();
		const nuevaVersion = version + 1;
		await tx.update(fichasApoyo).set({
			...contenido,
			version: nuevaVersion,
			autorId
		}).where(condicion);
		return {
			version: nuevaVersion,
			cambio: actual.id
		};
	});
	if (resultado.cambio) await registrarAccion({
		usuarioId: autorId,
		accion: "ficha_apoyo_editar",
		tablaDestino: "fichas_apoyo",
		idDestino: resultado.cambio
	});
	return resultado.version;
}
//#endregion
//#region src/routes/laboratorio/apoyos/fichas/+page.server.ts
var id = z.string().regex(/^[1-9]\d*$/).transform(Number).pipe(z.number().int().positive().max(2147483647));
var numeroVersion = z.string().regex(/^(0|[1-9]\d*)$/).transform(Number).pipe(z.number().int().nonnegative().max(2147483647));
async function acceso(locals) {
	if (!locals.usuario) redirect(303, "/auth?redirect=%2Flaboratorio%2Fapoyos%2Ffichas");
	if (!aulaPilotoHabilitada()) error(404, "Las fichas están disponibles en el piloto local.");
	const curso = id.safeParse(private_env.MOODLE_AULA_CURSO_ID);
	if (!curso.success) error(503, "Falta configurar el curso de prueba.");
	const usuarioId = locals.usuario.usuarioId;
	if (!await puedeGestionarFichaApoyo(usuarioId, curso.data)) error(403, "Este curso no está asignado a tu cuenta.");
	for (const clave of ["MOODLE_AULA_QUIZ_TOKEN", "MOODLE_AULA_TOKEN"]) {
		if (!private_env[clave]?.trim()) continue;
		try {
			const moodle = servicioMoodleDePrueba(private_env, clave);
			return {
				usuarioId,
				cursoId: curso.data,
				alumnos: await moodle.listarAlumnos(curso.data)
			};
		} catch {}
	}
	error(503, "No se pudo verificar el padrón del curso en Moodle de prueba.");
}
function seleccionar(alumnos, valor) {
	if (valor === null) return alumnos[0] ?? null;
	const alumnoId = id.safeParse(valor);
	if (!alumnoId.success) error(400, "Elegí un estudiante válido.");
	const alumno = alumnos.find((a) => a.id === alumnoId.data);
	if (!alumno) error(403, "Ese estudiante no está matriculado en el curso de prueba.");
	return alumno;
}
var load = async ({ locals, url, setHeaders }) => {
	setHeaders({ "cache-control": "private, no-store" });
	const { usuarioId, cursoId, alumnos } = await acceso(locals);
	const alumno = seleccionar(alumnos, url.searchParams.get("alumnoId"));
	try {
		const gabinete = await puedeVerEvidenciasDeGabinete(usuarioId, cursoId);
		const [ficha, evidencias] = alumno ? await Promise.all([leerFichaApoyo(cursoId, alumno.id), gabinete ? leerEvidenciasFichaCiencias(private_env, cursoId, alumno.id).catch(() => null) : null]) : [null, null];
		return {
			alumnos,
			alumno,
			ficha,
			gabinete,
			evidencias
		};
	} catch {
		error(503, "No se pudo abrir la ficha en Legajo. Volvé a intentar.");
	}
};
var actions = { guardar: async ({ locals, request, url }) => {
	const { usuarioId, cursoId, alumnos } = await acceso(locals);
	const form = await request.formData();
	const alumnoId = id.safeParse(form.get("alumnoId"));
	const version = numeroVersion.safeParse(form.get("version"));
	if (!alumnoId.success || !version.success) return fail(400, { error: "Revisá el estudiante y la versión de la ficha." });
	const alumno = seleccionar(alumnos, url.searchParams.get("alumnoId") ?? String(alumnoId.data));
	if (alumno?.id !== alumnoId.data) return fail(400, { error: "El estudiante del formulario cambió. Volvé a abrir la ficha." });
	const borrador = Object.fromEntries(datosFichaApoyo.keyof().options.map((campo) => {
		const valor = form.get(campo);
		return [campo, typeof valor === "string" ? valor : ""];
	}));
	const datos = datosFichaApoyo.safeParse(borrador);
	if (!datos.success) {
		const campo = datos.error.issues[0]?.path[0];
		return fail(400, {
			error: `Revisá el campo «${campo === "revision" ? "fecha de revisión" : campo}».`,
			alumnoId: alumno.id,
			borrador: Object.fromEntries(Object.entries(borrador).map(([k, v]) => [k, v.slice(0, 1400)])),
			version: version.data
		});
	}
	try {
		const guardada = await guardarFichaApoyo(cursoId, alumno.id, usuarioId, version.data, datos.data);
		return {
			alumnoId: alumno.id,
			guardada
		};
	} catch (err) {
		if (err instanceof ConflictoFichaApoyo) return fail(409, {
			alumnoId: alumno.id,
			error: "Otra persona guardó cambios en esta ficha.",
			conflicto: true,
			borrador: datos.data,
			version: version.data
		});
		return fail(503, {
			alumnoId: alumno.id,
			error: "No se pudo confirmar el guardado. Volvé a intentar.",
			borrador: datos.data,
			version: version.data
		});
	}
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 47;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CwjnEIyP.js')).default;
const server_id = "src/routes/laboratorio/apoyos/fichas/+page.server.ts";
const imports = ["_app/immutable/nodes/47.CV6XKn7z.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js","_app/immutable/chunks/xDlSgPMc.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=47-Dm7vfrYd.js.map
