//#region src/lib/server/gabinete/alerta.ts
var UMBRALES = {
	ausenciasAtencion: 2,
	ausenciasAlerta: 4,
	retrasosAtencion: 4,
	notaAlerta: 60,
	notaAtencion: 70,
	observacionBaja: 2
};
function asistencia(d) {
	const a = d.ausenciasRecientes;
	if (a >= UMBRALES.ausenciasAlerta) return {
		nivel: "alerta",
		detalle: `${a} ausencias en los últimos 30 días (${d.ausenciasCiclo} en el ciclo).`
	};
	if (a >= UMBRALES.ausenciasAtencion) return {
		nivel: "atencion",
		detalle: `${a} ausencias en los últimos 30 días (${d.ausenciasCiclo} en el ciclo).`
	};
	if (d.retrasosRecientes >= UMBRALES.retrasosAtencion) return {
		nivel: "atencion",
		detalle: `${d.retrasosRecientes} llegadas tarde en los últimos 30 días.`
	};
	return {
		nivel: "ok",
		detalle: `${a} ausencias en 30 días (${d.ausenciasCiclo} en el ciclo).`
	};
}
function conducta(d) {
	const { leve, mediana, grave } = d.amonestaciones;
	const total = leve + mediana + grave;
	const partes = [];
	if (grave) partes.push(`${grave} grave${grave > 1 ? "s" : ""}`);
	if (mediana) partes.push(`${mediana} mediana${mediana > 1 ? "s" : ""}`);
	if (leve) partes.push(`${leve} leve${leve > 1 ? "s" : ""}`);
	const resumen = total ? `Amonestaciones en 60 días: ${partes.join(", ")}.` : "";
	if (grave >= 1 || total >= 3) return {
		nivel: "alerta",
		detalle: resumen
	};
	if (total >= 1) return {
		nivel: "atencion",
		detalle: resumen
	};
	if (d.actitud != null && d.actitud <= UMBRALES.observacionBaja) return {
		nivel: "atencion",
		detalle: `Actitud observada baja (promedio ${d.actitud} de 5).`
	};
	return {
		nivel: "ok",
		detalle: "Sin amonestaciones recientes."
	};
}
function rendimiento(d) {
	if (d.nota != null) {
		if (d.nota < UMBRALES.notaAlerta) return {
			nivel: "alerta",
			detalle: `Nota en Moodle: ${Math.round(d.nota)}.`
		};
		if (d.nota < UMBRALES.notaAtencion) return {
			nivel: "atencion",
			detalle: `Nota en Moodle: ${Math.round(d.nota)}.`
		};
	}
	if (d.tareasOk != null && d.tareasOk < 50) return {
		nivel: "atencion",
		detalle: `Completa el ${d.tareasOk}% de las tareas observadas.`
	};
	if (d.participacion != null && d.participacion <= UMBRALES.observacionBaja) return {
		nivel: "atencion",
		detalle: `Participación observada baja (promedio ${d.participacion} de 5).`
	};
	if (d.nota == null && d.tareasOk == null && d.participacion == null) return {
		nivel: "sin_datos",
		detalle: d.nota === void 0 ? "Sin observaciones (notas no consultadas)." : "Sin nota ni observaciones."
	};
	return {
		nivel: "ok",
		detalle: d.nota != null ? `Nota en Moodle: ${Math.round(d.nota)}.` : "Sin señales en observaciones."
	};
}
function vinculos(d) {
	const s = d.social;
	if (!s) return {
		nivel: "sin_datos",
		detalle: "Sin votación de agrupamientos reciente."
	};
	if (s.sostenida) return {
		nivel: "alerta",
		detalle: "Poco elegido en varias votaciones seguidas."
	};
	if (s.exposicion >= 3 && s.recibidas === 0) return {
		nivel: "alerta",
		detalle: `No recibió elecciones (podían elegirlo ${s.exposicion}).`
	};
	if (s.acompanar) return {
		nivel: "atencion",
		detalle: `Recibió ${s.recibidas} de ${s.exposicion} elecciones posibles.`
	};
	return {
		nivel: "ok",
		detalle: `Recibió ${s.recibidas} de ${s.exposicion} elecciones posibles.`
	};
}
var PESO = {
	alerta: 2,
	atencion: 1,
	ok: 0,
	sin_datos: 0
};
function evaluarAlumno(d) {
	const fila = {
		id: d.id,
		nombre: d.nombre,
		asistencia: asistencia(d),
		conducta: conducta(d),
		rendimiento: rendimiento(d),
		vinculos: vinculos(d)
	};
	const puntos = PESO[fila.asistencia.nivel] + PESO[fila.conducta.nivel] + PESO[fila.rendimiento.nivel] + PESO[fila.vinculos.nivel];
	const nivel = puntos >= 4 ? 3 : puntos >= 2 ? 2 : 1;
	return {
		...fila,
		puntos,
		nivel
	};
}
/** Motivo de apertura de caso a partir de las áreas comprometidas. */
function motivoDesdeAlerta(f) {
	const lineas = [
		["Asistencia", f.asistencia],
		["Conducta", f.conducta],
		["Rendimiento", f.rendimiento],
		["Vínculos", f.vinculos]
	].filter(([, i]) => i.nivel === "alerta" || i.nivel === "atencion").map(([n, i]) => `• ${n} (${i.nivel === "alerta" ? "alerta" : "atención"}): ${i.detalle}`);
	return `Detectado por el sistema de alerta temprana (nivel ${f.nivel}).\n${lineas.join("\n")}`;
}
//#endregion
//#region src/lib/server/gabinete/guia.ts
var ESTADOS_CASO = [
	{
		id: "derivado",
		nombre: "Derivado",
		desc: "Llegó la derivación; falta la primera evaluación."
	},
	{
		id: "evaluacion",
		nombre: "En evaluación",
		desc: "Recolectando información (entrevistas, observación)."
	},
	{
		id: "intervencion",
		nombre: "En intervención",
		desc: "Hay un plan de apoyo en marcha."
	},
	{
		id: "seguimiento",
		nombre: "En seguimiento",
		desc: "Mejoró; se monitorea con menor frecuencia."
	},
	{
		id: "cerrado",
		nombre: "Cerrado",
		desc: "Sin necesidad de apoyo adicional por ahora."
	}
];
var ESTADO_IDS = ESTADOS_CASO.map((e) => e.id);
var TIPOS_INTERVENCION = [
	{
		id: "entrevista_alumno",
		nombre: "Entrevista con el alumno"
	},
	{
		id: "entrevista_familia",
		nombre: "Entrevista con la familia"
	},
	{
		id: "reunion_docentes",
		nombre: "Reunión con docentes / equipo"
	},
	{
		id: "observacion_aula",
		nombre: "Observación en el aula"
	},
	{
		id: "plan_apoyo",
		nombre: "Plan de apoyo (objetivos y acuerdos)"
	},
	{
		id: "check_connect",
		nombre: "Encuentro de seguimiento (Check & Connect)"
	},
	{
		id: "derivacion_externa",
		nombre: "Derivación / articulación externa"
	},
	{
		id: "derivacion",
		nombre: "Derivación recibida"
	},
	{
		id: "seguimiento",
		nombre: "Revisión del caso"
	},
	{
		id: "otro",
		nombre: "Otro"
	}
];
var TIPO_IDS = TIPOS_INTERVENCION.map((t) => t.id);
/** Cada cuánto revisar un caso según el nivel (monitoreo del progreso). */
var DIAS_REVISION = {
	1: 56,
	2: 28,
	3: 14
};
function fechaMasDias(dias, desde = /* @__PURE__ */ new Date()) {
	const d = new Date(desde);
	d.setDate(d.getDate() + dias);
	return d.toISOString().slice(0, 10);
}
var GUIA_POR_NIVEL = {
	1: {
		titulo: "Nivel 1 — Apoyo universal (todo el curso)",
		sugerencias: [{
			texto: "Trabajo cooperativo con roles rotativos y ubicación inclusiva en el aula (módulo Agrupamientos).",
			fundamento: "Johnson & Johnson; Cohen & Lotan; van den Berg & Stoltz (2018)."
		}, {
			texto: "Normas de aula claras, enseñadas y reconocidas en positivo, en lugar de solo sancionar.",
			fundamento: "Apoyo conductual positivo (PBIS) — Sugai & Horner (2002)."
		}]
	},
	2: {
		titulo: "Nivel 2 — Apoyo focalizado",
		sugerencias: [
			{
				texto: "Asignar un adulto referente que se encuentre con el alumno cada semana, revise asistencia, conducta y notas, y mantenga contacto con la familia (Check & Connect).",
				fundamento: "Sinclair, Christenson, Evelo & Hurley (1998), Exceptional Children 65(1)."
			},
			{
				texto: "Tarjeta diaria con 2-3 metas de conducta: breve encuentro al llegar y al irse, con devolución de cada docente (Check-In/Check-Out).",
				fundamento: "Hawken & Horner (2003), Journal of Behavioral Education."
			},
			{
				texto: "Fortalecer el vínculo con al menos un docente: el afecto y la cercanía docente-alumno sostienen el compromiso.",
				fundamento: "Roorda, Koomen, Spilt & Oort (2011), Review of Educational Research 81(4)."
			},
			{
				texto: "Si el área comprometida es Vínculos: tutoría entre pares, rol visible en el grupo y banco junto a un compañero que lo acepte.",
				fundamento: "Topping (2005); Cohen & Lotan; van den Berg & Stoltz (2018)."
			}
		]
	},
	3: {
		titulo: "Nivel 3 — Apoyo intensivo e individual",
		sugerencias: [
			{
				texto: "Plan individual con 1-3 objetivos observables, responsables y fecha de revisión; medir el progreso cada 2 semanas y ajustar si no hay avance.",
				fundamento: "Respuesta a la intervención (RTI/MTSS) — Fuchs & Fuchs (2006), Reading Research Quarterly."
			},
			{
				texto: "Entrevista con la familia para acordar estrategias compartidas casa-escuela.",
				fundamento: "Hill & Tyson (2009), meta-análisis, Developmental Psychology 45(3)."
			},
			{
				texto: "Evaluar barreras de aprendizaje y articular con profesionales externos cuando corresponda.",
				fundamento: "Trabajo interdisciplinario del equipo de orientación."
			}
		]
	}
};

export { DIAS_REVISION as D, ESTADOS_CASO as E, GUIA_POR_NIVEL as G, TIPO_IDS as T, UMBRALES as U, ESTADO_IDS as a, TIPOS_INTERVENCION as b, evaluarAlumno as e, fechaMasDias as f, motivoDesdeAlerta as m };
//# sourceMappingURL=guia-Cz0z5vQo.js.map
