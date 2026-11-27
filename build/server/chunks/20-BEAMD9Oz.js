import { p as private_env } from './shared-server-asDUS7ug.js';
import { d as db, F as aulaOrales, G as aulaPublicaciones } from './db-CLN6I8p_.js';
import { r as puedeEvaluarCurso } from './authz-BVdVv-6k.js';
import { r as registrarAccion } from './audit-Dz9I-BN1.js';
import { a as aulaPilotoHabilitada } from './aulaPiloto-DLB6Zm9h.js';
import { s as servicioMoodleDePrueba } from './aula-rest-Gaa3l_kU.js';
import { fail, error, redirect } from '@sveltejs/kit';
import { eq, and, or, isNull, lte, sql, desc } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

//#region src/lib/aula/oral.ts
var ORAL_CIENCIAS = {
	titulo: "¿Qué canilla consume más agua?",
	objetivo: "Comparar caudales y justificar una decisión con datos y unidades.",
	consigna: "La canilla A llenó 12 litros en 3 minutos. La B llenó 18 litros en 3 minutos. Explicá cuál entrega más agua por minuto y qué condición mantendrías igual al compararlas.",
	criterios: [
		{
			id: "caudales",
			nombre: "Compara los caudales",
			niveles: [
				"La respuesta falla en ambos cálculos y en la comparación.",
				"Acierta una parte de los cálculos o de la comparación.",
				"Obtiene 4 para A y 6 para B, o valores equivalentes, e identifica a B como la de mayor caudal."
			]
		},
		{
			id: "unidades",
			nombre: "Usa las unidades",
			niveles: [
				"Omite las unidades o usa unidades incompatibles en ambos resultados.",
				"Usa una unidad de caudal correcta en uno de los dos resultados.",
				"Expresa ambos resultados en L/min o en unidades equivalentes."
			]
		},
		{
			id: "justificacion",
			nombre: "Justifica la decisión",
			niveles: [
				"La explicación carece de datos pertinentes y de una condición comparable.",
				"Menciona datos pertinentes o una condición comparable.",
				"Fundamenta con los datos y señala una condición comparable, como la apertura."
			]
		}
	]
};
var NIVELES_ORAL = [
	0,
	1,
	2
];
var APOYOS_ORAL = [
	"lectura",
	"guia_visual",
	"comunicador",
	"tiempo_adicional",
	"otro"
];
var NOMBRES_APOYO_ORAL = {
	lectura: "Lectura de la consigna",
	guia_visual: "Guía visual por pasos",
	comunicador: "Comunicador o tablero",
	tiempo_adicional: "Tiempo adicional",
	otro: "Otro apoyo"
};
var ESTADOS_ORAL = {
	evaluado: "Evaluado",
	ausente: "Ausente",
	sin_observar: "Sin observar"
};
function notaOral(criterios) {
	const valores = ORAL_CIENCIAS.criterios.map(({ id }) => criterios[id]);
	if (valores.some((valor) => valor !== 0 && valor !== 1 && valor !== 2)) return null;
	const total = valores.reduce((suma, valor) => suma + (valor ?? 0), 0);
	return Math.round(total * 1e3 / 6) / 100;
}

//#region src/lib/server/moodle/aula-api.ts
var id = z.number().int().positive().safe();
var intento = z.number().int().nonnegative().safe();
var sinAvisos = z.object({ warnings: z.array(z.unknown()).max(0).optional() });
var destinos = sinAvisos.extend({ courses: z.array(z.object({
	id,
	assignments: z.array(z.object({
		id,
		cmid: id,
		course: id,
		name: z.string(),
		grade: z.number().finite(),
		nosubmissions: z.number(),
		teamsubmission: z.number(),
		blindmarking: z.number(),
		markingworkflow: z.number(),
		attemptreopenmethod: z.string(),
		maxattempts: z.number(),
		configs: z.array(z.object({
			plugin: z.string(),
			subtype: z.string(),
			name: z.string(),
			value: z.string()
		}))
	}))
})) });
var estadoTarea = sinAvisos.extend({
	lastattempt: z.object({ submission: z.object({ attemptnumber: intento }).optional() }).optional(),
	feedback: z.object({
		grade: z.object({
			assignment: id.optional(),
			userid: id,
			attemptnumber: intento,
			grade: z.string().regex(/^-?\d+(\.\d+)?$/)
		}).optional(),
		plugins: z.array(z.object({
			type: z.string(),
			editorfields: z.array(z.object({
				name: z.string(),
				text: z.string()
			})).optional()
		})).optional()
	}).optional()
});
var libro = sinAvisos.extend({ usergrades: z.array(z.object({
	courseid: id,
	userid: id,
	gradeitems: z.array(z.object({
		itemtype: z.string(),
		itemmodule: z.string().nullable(),
		iteminstance: z.number().int().nullable(),
		itemnumber: z.number().int().nullable(),
		locked: z.boolean().optional(),
		gradeislocked: z.boolean().optional(),
		gradeisoverridden: z.boolean().optional(),
		graderaw: z.number().finite().nullable().optional()
	}))
})) });
function crearMoodleAulaConEntorno(entorno) {
	const { cursoId: cursoPermitido, llamar, listarAlumnos } = servicioMoodleDePrueba(entorno, "MOODLE_AULA_TOKEN");
	const tarea = id.safeParse(Number(entorno.MOODLE_AULA_TAREA_ID));
	if (!tarea.success) throw new Error("Falta el identificador de la Tarea de prueba.");
	const tareaPermitida = tarea.data;
	function verificarDestino(cursoId, tareaId = tareaPermitida) {
		if (cursoId !== cursoPermitido || tareaId !== tareaPermitida) throw new Error("Ese curso o esa Tarea no están habilitados para el piloto.");
	}
	async function obtenerTarea(cursoId, tareaId) {
		verificarDestino(cursoId, tareaId);
		const { courses } = await llamar("mod_assign_get_assignments", {
			"courseids[0]": cursoId,
			"capabilities[0]": "mod/assign:grade"
		}, destinos);
		const tarea = courses.find((curso) => curso.id === cursoId)?.assignments.find((item) => item.id === tareaId && item.course === cursoId);
		if (!tarea) throw new Error("No encontré la Tarea habilitada en el curso de prueba.");
		if (tarea.grade <= 0 || tarea.nosubmissions !== 1 || tarea.teamsubmission !== 0 || tarea.blindmarking !== 0 || tarea.markingworkflow !== 0 || tarea.attemptreopenmethod !== "none" && tarea.maxattempts !== 1) throw new Error("Configurá una Tarea individual con nota numérica y sin entregas, nuevos intentos ni flujo de corrección.");
		if (!tarea.configs.some((config) => config.plugin === "comments" && config.subtype === "assignfeedback" && config.name === "enabled" && config.value === "1")) throw new Error("Habilitá los comentarios de retroalimentación en la Tarea de prueba.");
		return {
			id: tarea.id,
			cursoId,
			cmid: tarea.cmid,
			nombre: tarea.name,
			calificacionMaxima: tarea.grade
		};
	}
	async function leerNota(tareaId, alumnoId) {
		verificarDestino(cursoPermitido, tareaId);
		id.parse(alumnoId);
		const [estado, informe] = await Promise.all([llamar("mod_assign_get_submission_status", {
			assignid: tareaId,
			userid: alumnoId,
			moodlewssettingraw: 1
		}, estadoTarea), llamar("gradereport_user_get_grade_items", {
			courseid: cursoPermitido,
			userid: alumnoId
		}, libro)]);
		const nota = estado.feedback?.grade;
		if (nota && (nota.userid !== alumnoId || nota.assignment !== void 0 && nota.assignment !== tareaId)) throw new Error("Moodle devolvió una nota que no coincide con el alumno o la Tarea.");
		const item = informe.usergrades.find((registro) => registro.userid === alumnoId && registro.courseid === cursoPermitido)?.gradeitems.find((item) => item.itemtype === "mod" && item.itemmodule === "assign" && item.iteminstance === tareaId && item.itemnumber === 0);
		if (!item) throw new Error("No encontré el ítem de esa Tarea en el libro de Moodle.");
		const comentario = estado.feedback?.plugins?.find((plugin) => plugin.type === "comments")?.editorfields?.find((campo) => campo.name === "comments")?.text;
		const valor = nota ? Number(nota.grade) : -1;
		return {
			nota: valor >= 0 ? valor : null,
			intento: nota?.attemptnumber ?? estado.lastattempt?.submission?.attemptnumber ?? 0,
			feedback: comentario?.replace(/\r\n?/g, "\n").trim() || null,
			notaLibro: item.graderaw ?? null,
			bloqueada: item.locked === true || item.gradeislocked === true,
			sobrescrita: item.gradeisoverridden === true
		};
	}
	async function publicarNota(datos) {
		const tarea = await obtenerTarea(datos.cursoId, datos.tareaId);
		id.parse(datos.alumnoId);
		if (datos.intento !== 0) throw new Error("El piloto solo admite el primer intento de la Tarea.");
		if (!Number.isFinite(datos.nota) || datos.nota < 0 || datos.nota > tarea.calificacionMaxima) throw new Error("La nota no entra en el rango de la Tarea de Moodle.");
		const feedback = datos.feedback.replace(/\r\n?/g, "\n").trim();
		await llamar("mod_assign_save_grade", {
			assignmentid: tarea.id,
			userid: datos.alumnoId,
			grade: datos.nota,
			attemptnumber: datos.intento,
			addattempt: 0,
			workflowstate: "",
			applytoall: 0,
			"plugindata[assignfeedbackcomments_editor][text]": feedback,
			"plugindata[assignfeedbackcomments_editor][format]": 2
		}, z.null());
	}
	return {
		obtenerTarea,
		listarAlumnos,
		leerNota,
		publicarNota
	};
}
//#endregion
//#region src/lib/server/moodle/aula.ts
function crearMoodleAula() {
	return crearMoodleAulaConEntorno(private_env);
}
//#endregion
//#region src/lib/server/services/aulaOral.ts
var PLAZO_PROCESO_MS = 12e4;
var ErrorAulaOral = class extends Error {};
var contexto = (destino) => and(eq(aulaOrales.cursoMoodleId, destino.cursoId), eq(aulaOrales.tareaMoodleId, destino.tareaId));
var alumnoEn = (destino, alumnoId) => and(contexto(destino), eq(aulaOrales.alumnoMoodleId, alumnoId));
var publicacionDe = (oralId, revision) => and(eq(aulaPublicaciones.oralId, oralId), eq(aulaPublicaciones.revision, revision));
async function listarOrales(destino) {
	return (await db.select({
		oral: aulaOrales,
		publicacion: aulaPublicaciones
	}).from(aulaOrales).leftJoin(aulaPublicaciones, and(eq(aulaPublicaciones.oralId, aulaOrales.id), eq(aulaPublicaciones.revision, aulaOrales.revision))).where(contexto(destino))).map(({ oral, publicacion }) => ({
		alumnoId: oral.alumnoMoodleId,
		revision: oral.revision,
		versionRubrica: oral.versionRubrica,
		apoyo: oral.apoyo,
		estado: oral.estado,
		caudales: oral.caudales,
		unidades: oral.unidades,
		justificacion: oral.justificacion,
		devolucion: oral.devolucion,
		nota: oral.estado === "evaluado" ? notaOral(oral) : null,
		publicacion: publicacion?.estado ?? null,
		detalle: publicacion?.ultimoError ?? null
	}));
}
async function guardarOral(destino, autorId, registro) {
	const { alumnoId, revision, cambioApoyo, revisarRubrica, ...valores } = registro;
	const condicion = alumnoEn(destino, alumnoId);
	const registroCambiado = await db.transaction(async (tx) => {
		const [actual] = await tx.select().from(aulaOrales).where(condicion).for("update");
		if (!actual) {
			if (revision !== 0) throw new ErrorAulaOral("La evaluación cambió. Volvé a abrir el registro.");
			const [insercion] = await tx.insert(aulaOrales).values({
				...valores,
				autorId,
				versionRubrica: 2,
				apoyo: cambioApoyo?.elegido ?? null,
				cursoMoodleId: destino.cursoId,
				tareaMoodleId: destino.tareaId,
				alumnoMoodleId: alumnoId
			});
			return insercion.insertId;
		}
		const editaApoyo = cambioApoyo && cambioApoyo.elegido !== cambioApoyo.anterior;
		if (editaApoyo && cambioApoyo.anterior !== actual.apoyo && cambioApoyo.elegido !== actual.apoyo) throw new ErrorAulaOral("Otra persona cambió el apoyo. Recargá para revisar.");
		const apoyo = editaApoyo ? cambioApoyo.elegido : actual.apoyo;
		const cambioCriterios = actual.caudales !== valores.caudales || actual.unidades !== valores.unidades || actual.justificacion !== valores.justificacion;
		const cambioEvaluacion = cambioCriterios || actual.estado !== valores.estado || actual.devolucion !== valores.devolucion;
		const habiaCriterios = actual.caudales !== null || actual.unidades !== null || actual.justificacion !== null;
		if (actual.versionRubrica < 2 && valores.estado === "evaluado" && cambioCriterios && habiaCriterios && !revisarRubrica) throw new ErrorAulaOral("Confirmá que volviste a observar los criterios con la rúbrica actual.");
		const versionRubrica = valores.estado === "evaluado" && (revisarRubrica || cambioCriterios && !habiaCriterios) ? 2 : actual.versionRubrica;
		if (!cambioEvaluacion && apoyo === actual.apoyo && versionRubrica === actual.versionRubrica) return;
		if (revision !== actual.revision) throw new ErrorAulaOral("Otra persona actualizó la evaluación. Recargá para revisar.");
		if (!cambioEvaluacion) {
			await tx.update(aulaOrales).set({
				apoyo,
				versionRubrica
			}).where(eq(aulaOrales.id, actual.id));
			return actual.id;
		}
		const [publicacion] = await tx.select().from(aulaPublicaciones).where(publicacionDe(actual.id, revision));
		if (publicacion && (publicacion.estado === "pendiente" || publicacion.estado === "enviando" || publicacion.estado === "error")) throw new ErrorAulaOral("Primero resolvé la publicación pendiente antes de corregir este registro.");
		if ((valores.estado !== "evaluado" || notaOral(valores) === null) && (await tx.select({ id: aulaPublicaciones.id }).from(aulaPublicaciones).where(and(eq(aulaPublicaciones.oralId, actual.id), eq(aulaPublicaciones.estado, "verificado"))).limit(1)).length) throw new ErrorAulaOral("Ya hay nota en Moodle. Una corrección necesita los tres criterios completos.");
		await tx.update(aulaOrales).set({
			...valores,
			apoyo,
			versionRubrica,
			autorId,
			revision: revision + 1
		}).where(eq(aulaOrales.id, actual.id));
		return actual.id;
	});
	if (registroCambiado) await registrarAccion({
		usuarioId: autorId,
		accion: "aula_oral_guardar",
		tablaDestino: "aula_orales",
		idDestino: registroCambiado
	});
}
async function encolar(destino, autorId, seleccion) {
	return db.transaction(async (tx) => {
		const trabajos = [];
		for (const item of [...seleccion].sort((a, b) => a.alumnoId - b.alumnoId)) {
			const [oral] = await tx.select().from(aulaOrales).where(alumnoEn(destino, item.alumnoId)).for("update");
			if (!oral || oral.revision !== item.revision || oral.estado !== "evaluado") throw new ErrorAulaOral("Una evaluación cambió. Revisá el lote antes de publicarlo.");
			const nota = notaOral(oral);
			if (nota === null) throw new ErrorAulaOral("Completá los tres criterios antes de publicar.");
			const [existente] = await tx.select().from(aulaPublicaciones).where(publicacionDe(oral.id, oral.revision));
			if (existente) {
				trabajos.push({
					oral,
					id: existente.id
				});
				continue;
			}
			const [insercion] = await tx.insert(aulaPublicaciones).values({
				oralId: oral.id,
				revision: oral.revision,
				autorId,
				nota: nota.toFixed(2),
				devolucion: oral.devolucion
			});
			trabajos.push({
				oral,
				id: insercion.insertId
			});
		}
		return trabajos;
	});
}
function mismoFeedback(moodle, local) {
	return (moodle ?? "").replace(/\r\n?/g, "\n").trim() === local.replace(/\r\n?/g, "\n").trim();
}
function coincide(nota, publicacion) {
	return nota.nota === Number(publicacion.nota) && mismoFeedback(nota.feedback, publicacion.devolucion);
}
async function procesar(moodle, oral, id) {
	const idProceso = randomUUID();
	const operador = and(eq(aulaPublicaciones.id, id), eq(aulaPublicaciones.idProceso, idProceso));
	const listo = or(eq(aulaPublicaciones.estado, "pendiente"), eq(aulaPublicaciones.estado, "error"), eq(aulaPublicaciones.estado, "conflicto"), and(eq(aulaPublicaciones.estado, "enviando"), or(isNull(aulaPublicaciones.procesandoDesde), lte(aulaPublicaciones.procesandoDesde, new Date(Date.now() - PLAZO_PROCESO_MS)))));
	const trabajo = await db.transaction(async (tx) => {
		const [vigente] = await tx.select({ revision: aulaOrales.revision }).from(aulaOrales).where(eq(aulaOrales.id, oral.id)).for("update");
		if (vigente?.revision !== oral.revision) return;
		const [reclamo] = await tx.update(aulaPublicaciones).set({
			estado: "enviando",
			idProceso,
			procesandoDesde: /* @__PURE__ */ new Date(),
			intentos: sql`${aulaPublicaciones.intentos} + 1`
		}).where(and(eq(aulaPublicaciones.id, id), listo));
		if (!reclamo.affectedRows) return;
		const [publicacion] = await tx.select().from(aulaPublicaciones).where(operador);
		return publicacion;
	});
	if (!trabajo) return;
	const terminar = (estado, ultimoError, intento) => db.update(aulaPublicaciones).set({
		estado,
		ultimoError,
		idProceso: null,
		procesandoDesde: null,
		verificadoAt: estado === "verificado" ? /* @__PURE__ */ new Date() : null,
		...intento === void 0 ? {} : { intentoMoodle: intento }
	}).where(operador);
	try {
		const leer = () => moodle.leerNota(oral.tareaMoodleId, oral.alumnoMoodleId);
		let remoto = await leer();
		if (remoto.bloqueada || remoto.sobrescrita) {
			await terminar("conflicto", "La calificación está bloqueada o sobrescrita en Moodle.");
			return;
		}
		if (trabajo.intentoMoodle !== null && remoto.intento !== trabajo.intentoMoodle) {
			await terminar("conflicto", "El intento activo cambió en Moodle.");
			return;
		}
		if (!coincide(remoto, trabajo)) {
			if (remoto.nota !== null || remoto.notaLibro !== null || (remoto.feedback ?? "").trim() !== "") {
				const [anterior] = await db.select().from(aulaPublicaciones).where(and(eq(aulaPublicaciones.oralId, oral.id), eq(aulaPublicaciones.estado, "verificado"), lte(aulaPublicaciones.revision, trabajo.revision - 1))).orderBy(desc(aulaPublicaciones.revision)).limit(1);
				if (!anterior || !coincide(remoto, anterior) || remoto.notaLibro !== Number(anterior.nota) || anterior.intentoMoodle !== null && anterior.intentoMoodle !== remoto.intento) {
					await terminar("conflicto", "La nota o devolución ya cambió en Moodle. Revisala antes de volver a publicar.");
					return;
				}
			}
			const [reserva] = await db.update(aulaPublicaciones).set({ intentoMoodle: remoto.intento }).where(operador);
			if (!reserva.affectedRows) return;
			await moodle.publicarNota({
				cursoId: oral.cursoMoodleId,
				tareaId: oral.tareaMoodleId,
				alumnoId: oral.alumnoMoodleId,
				intento: remoto.intento,
				nota: Number(trabajo.nota),
				feedback: trabajo.devolucion
			});
			remoto = await leer();
		}
		if (!coincide(remoto, trabajo) || remoto.notaLibro !== Number(trabajo.nota) || remoto.bloqueada || remoto.sobrescrita) {
			await terminar("error", "Moodle aún no confirmó la misma nota y devolución. Volvé a verificar el envío.");
			return;
		}
		await terminar("verificado", null, remoto.intento);
	} catch {
		await terminar("error", "No se pudo verificar el envío con Moodle. Al reintentar se revisará primero lo que quedó guardado.");
	}
}
async function publicarOrales(destino, autorId, seleccion, moodle) {
	const trabajos = await encolar(destino, autorId, seleccion);
	for (const { oral, id } of trabajos) await procesar(moodle, oral, id);
	const ids = new Set(seleccion.map((item) => item.alumnoId));
	const publicados = (await listarOrales(destino)).filter((fila) => ids.has(fila.alumnoId));
	return {
		verificados: publicados.filter((fila) => fila.publicacion === "verificado").length,
		restantes: publicados.filter((fila) => fila.publicacion !== "verificado").length
	};
}
//#endregion
//#region src/routes/aula/oral/+page.server.ts
var idPositivo = z.number().int().positive().safe();
var revision = z.object({
	alumnoId: idPositivo,
	revision: z.number().int().nonnegative().safe()
});
var nivel = z.enum([
	"0",
	"1",
	"2"
]).transform(Number).nullable();
var apoyo = z.union([z.enum(APOYOS_ORAL), z.literal("").transform(() => null)]);
var registro = revision.extend({
	estado: z.enum([
		"evaluado",
		"ausente",
		"sin_observar"
	]),
	caudales: nivel,
	unidades: nivel,
	justificacion: nivel,
	devolucion: z.string().trim().max(500),
	cambioApoyo: z.object({
		anterior: apoyo,
		elegido: apoyo
	}).optional(),
	revisarRubrica: z.boolean()
});
var lote = z.array(revision).min(1).max(50).refine((items) => new Set(items.map((item) => item.alumnoId)).size === items.length);
async function acceso(locals) {
	if (!aulaPilotoHabilitada()) error(404, "Aula en Legajo está disponible en el entorno de prueba.");
	if (!locals.usuario) redirect(303, "/auth?redirect=%2Faula%2Foral");
	const usuarioId = locals.usuario.usuarioId;
	const cursoId = idPositivo.safeParse(Number(private_env.MOODLE_AULA_CURSO_ID));
	const tareaId = idPositivo.safeParse(Number(private_env.MOODLE_AULA_TAREA_ID));
	if (!cursoId.success || !tareaId.success) error(503, "Falta configurar el curso y la tarea de Ciencias en Moodle de prueba.");
	if (!await puedeEvaluarCurso(usuarioId, cursoId.data)) error(403, "Este curso no está asignado a tu cuenta docente.");
	return {
		usuarioId,
		destino: {
			cursoId: cursoId.data,
			tareaId: tareaId.data
		}
	};
}
async function destinoMoodle(destino) {
	try {
		const moodle = crearMoodleAula();
		const [tarea, alumnos] = await Promise.all([moodle.obtenerTarea(destino.cursoId, destino.tareaId), moodle.listarAlumnos(destino.cursoId)]);
		if (tarea.calificacionMaxima !== 10) throw new Error("Escala de prueba inválida");
		return {
			moodle,
			tarea,
			alumnos
		};
	} catch {
		error(503, "No se pudo cargar el curso o la tarea individual sobre 10 de Moodle de prueba.");
	}
}
var load = async ({ locals, setHeaders }) => {
	const { destino } = await acceso(locals);
	setHeaders({ "cache-control": "no-store" });
	const [{ tarea, alumnos }, orales] = await Promise.all([destinoMoodle(destino), listarOrales(destino)]);
	const registros = new Map(orales.map((fila) => [fila.alumnoId, fila]));
	return {
		actividad: ORAL_CIENCIAS,
		cursoId: destino.cursoId,
		tarea: { nombre: tarea.nombre },
		alumnos: alumnos.map((alumno) => ({
			...alumno,
			oral: registros.get(alumno.id) ?? null
		}))
	};
};
var actions = {
	guardar: async ({ request, locals }) => {
		const { usuarioId, destino } = await acceso(locals);
		const datos = await request.formData();
		const resultado = registro.safeParse({
			alumnoId: Number(datos.get("alumnoId")),
			revision: Number(datos.get("revision")),
			estado: datos.get("estado"),
			caudales: datos.get("caudales"),
			unidades: datos.get("unidades"),
			justificacion: datos.get("justificacion"),
			devolucion: datos.get("devolucion") ?? "",
			cambioApoyo: datos.has("apoyo") ? {
				anterior: datos.get("apoyoAnterior"),
				elegido: datos.get("apoyo")
			} : void 0,
			revisarRubrica: datos.get("revisarRubrica") === "si"
		});
		if (!resultado.success) return fail(400, { error: "Revisá el estado, los criterios, el apoyo y la devolución." });
		const { alumnos } = await destinoMoodle(destino);
		if (!alumnos.some((alumno) => alumno.id === resultado.data.alumnoId)) error(403, "El estudiante no está matriculado en este curso de prueba.");
		const valores = resultado.data;
		if (valores.estado !== "evaluado") valores.caudales = valores.unidades = valores.justificacion = null;
		try {
			await guardarOral(destino, usuarioId, valores);
			return { guardado: valores.alumnoId };
		} catch (err) {
			if (err instanceof ErrorAulaOral) return fail(409, { error: err.message });
			throw err;
		}
	},
	publicar: async ({ request, locals }) => {
		const { usuarioId, destino } = await acceso(locals);
		const form = await request.formData();
		if (form.get("confirmar") !== "si") return fail(400, { error: "Confirmá la publicación a Moodle de prueba." });
		let seleccion;
		try {
			seleccion = JSON.parse(String(form.get("seleccion")));
		} catch {
			return fail(400, { error: "No se pudo leer la selección de evaluaciones." });
		}
		const datos = lote.safeParse(seleccion);
		if (!datos.success) return fail(400, { error: "Seleccioná evaluaciones válidas para publicar." });
		const { moodle, alumnos } = await destinoMoodle(destino);
		const ids = new Set(alumnos.map((alumno) => alumno.id));
		if (datos.data.some((fila) => !ids.has(fila.alumnoId))) error(403, "El padrón de Moodle cambió. Recargá el curso.");
		try {
			return { envio: await publicarOrales(destino, usuarioId, datos.data, moodle) };
		} catch (err) {
			if (err instanceof ErrorAulaOral) return fail(409, { error: err.message });
			throw err;
		}
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 20;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-FOiD--Gz.js')).default;
const server_id = "src/routes/aula/oral/+page.server.ts";
const imports = ["_app/immutable/nodes/20.V37odA_7.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/B8RcQQp0.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/M6KOCQrT.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = ["_app/immutable/assets/20.55mh5gUp.css"];
const fonts = [];

var _20 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	component: component,
	fonts: fonts,
	imports: imports,
	index: index,
	server: _page_server_ts,
	server_id: server_id,
	stylesheets: stylesheets
});

export { APOYOS_ORAL as A, ESTADOS_ORAL as E, NOMBRES_APOYO_ORAL as N, _20 as _, NIVELES_ORAL as a, notaOral as n };
//# sourceMappingURL=20-BEAMD9Oz.js.map
