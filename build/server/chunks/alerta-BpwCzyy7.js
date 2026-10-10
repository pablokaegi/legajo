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
	const rech = s.rechazos > 0 ? ` ${s.rechazos} pedido${s.rechazos > 1 ? "s" : ""} de no quedar juntos.` : "";
	if (s.sostenida) return {
		nivel: "alerta",
		detalle: `Poco elegido en varias votaciones seguidas.${rech}`
	};
	if (s.exposicion >= 3 && s.recibidas === 0) return {
		nivel: "alerta",
		detalle: `No recibió elecciones (podían elegirlo ${s.exposicion}).${rech}`
	};
	if (s.rechazos >= 3) return {
		nivel: "alerta",
		detalle: `Recibió ${s.recibidas} de ${s.exposicion} elecciones.${rech}`
	};
	if (s.acompanar || s.rechazos >= 2) return {
		nivel: "atencion",
		detalle: `Recibió ${s.recibidas} de ${s.exposicion} elecciones posibles.${rech}`
	};
	return {
		nivel: "ok",
		detalle: `Recibió ${s.recibidas} de ${s.exposicion} elecciones posibles.${rech}`
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

export { UMBRALES as U, evaluarAlumno as e, motivoDesdeAlerta as m };
//# sourceMappingURL=alerta-BpwCzyy7.js.map
