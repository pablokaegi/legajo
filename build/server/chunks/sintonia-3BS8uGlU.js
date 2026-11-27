//#region src/lib/server/agrupamientos/sintonia.ts
function parsePrediccion(raw) {
	if (!raw) return null;
	try {
		const p = JSON.parse(raw);
		const ids = (x) => Array.isArray(x) ? x.map(Number).filter((n) => Number.isInteger(n) && n > 0) : [];
		return {
			menosElegidos: ids(p?.menosElegidos),
			masElegidos: ids(p?.masElegidos),
			fecha: String(p?.fecha ?? "")
		};
	} catch {
		return null;
	}
}
function comparar(predichos, reales, nombre) {
	const p = new Set(predichos);
	const r = new Set(reales);
	const ref = (id) => ({
		id,
		nombre: nombre(id)
	});
	return {
		aciertos: [...r].filter((id) => p.has(id)).map(ref),
		noDetectados: [...r].filter((id) => !p.has(id)).map(ref),
		sorpresas: [...p].filter((id) => !r.has(id)).map(ref),
		deteccion: r.size > 0 ? Math.round([...r].filter((id) => p.has(id)).length / r.size * 100) : null
	};
}
function compararPrediccion(pred, analisis, nombre) {
	return {
		menos: comparar(pred.menosElegidos, analisis.menosElegidos, nombre),
		mas: comparar(pred.masElegidos, analisis.referentes.map((r) => r.id), nombre)
	};
}

export { compararPrediccion as c, parsePrediccion as p };
//# sourceMappingURL=sintonia-3BS8uGlU.js.map
