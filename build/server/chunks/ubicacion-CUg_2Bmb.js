import { m as mediana, a as mejorarConApoyo, d as distribuirSerpentina, r as redondear, b as repararBloqueos } from './agrupamientos-DwaMuOx0.js';

//#region src/lib/server/agrupamientos/gruposTrabajo.ts
/** Proporción de elecciones recibidas sobre las posibles; null si no hay base. */
function tasaEleccion(g, id) {
	const e = g.exposicion(id);
	return e > 0 ? g.recibidas(id) / e : null;
}
function generarGruposEquilibrados(g, opciones = {}) {
	const tamano = Math.max(2, Math.min(6, opciones.tamano ?? 4));
	if (g.alumnos.length < 2) return [];
	const conBase = g.alumnos.map((a) => tasaEleccion(g, a.id)).filter((t) => t != null);
	const neutro = conBase.length ? mediana(conBase) : 0;
	const estatus = (id) => tasaEleccion(g, id) ?? neutro;
	const ordenados = [...g.alumnos].sort((a, b) => estatus(b.id) - estatus(a.id) || a.id - b.id);
	const tercio = Math.max(1, Math.floor(ordenados.length / 3));
	const nivelPorId = /* @__PURE__ */ new Map();
	ordenados.forEach((a, i) => {
		nivelPorId.set(a.id, i < tercio ? "alto" : i < tercio * 2 ? "medio" : "bajo");
	});
	const nivel = (id) => nivelPorId.get(id) ?? "medio";
	return mejorarConApoyo(distribuirSerpentina(ordenados, tamano, g.bloqueado), nivel, g).map((gr) => ({
		miembros: gr.map((m) => ({
			...m,
			nivel: nivel(m.id)
		})),
		estatusPromedio: redondear(gr.reduce((s, m) => s + estatus(m.id), 0) / gr.length),
		sinVinculo: gr.filter((m) => !gr.some((x) => x.id !== m.id && (g.elige(m.id, x.id) || g.elige(x.id, m.id)))).length
	}));
}
//#endregion
//#region src/lib/server/agrupamientos/ubicacion.ts
var NUNCA = -1e3;
function generarUbicacion(g, analisis) {
	const alumnos = g.alumnos;
	if (alumnos.length === 0) return [];
	const ref = (id) => ({
		id,
		nombre: g.nombre(id)
	});
	const vulnerables = (analisis?.paraAcompanar ?? []).filter((p) => alumnos.some((a) => a.id === p.id)).map((p) => p.id);
	const esVulnerable = new Set(vulnerables);
	const tasas = alumnos.map((a) => tasaEleccion(g, a.id)).filter((t) => t != null);
	const med = tasas.length ? mediana(tasas) : 0;
	const aceptado = (id) => (tasaEleccion(g, id) ?? 0) >= med && g.rechazosRecibidos(id) === 0 && !esVulnerable.has(id);
	const puntaje = (v, p) => {
		if (g.bloqueado(v, p)) return NUNCA;
		let s = 0;
		if (aceptado(p)) s += 3;
		if (g.elige(v, p)) s += 2;
		if (g.elige(p, v)) s += 1;
		if (esVulnerable.has(p)) s -= 2;
		return s;
	};
	const lazo = (a, b) => g.bloqueado(a, b) ? NUNCA : (g.elige(a, b) ? 1 : 0) + (g.elige(b, a) ? 1 : 0);
	const libre = new Set(alumnos.map((a) => a.id));
	const bancosApoyo = [];
	const bancos = [];
	for (const v of vulnerables) {
		if (!libre.has(v)) continue;
		let mejor = -1;
		let mejorP = NUNCA;
		for (const p of libre) {
			if (p === v) continue;
			const s = puntaje(v, p);
			if (s > mejorP || s === mejorP && mejor >= 0 && p < mejor) {
				mejorP = s;
				mejor = p;
			}
		}
		if (mejor < 0 || mejorP <= NUNCA) continue;
		libre.delete(v);
		libre.delete(mejor);
		const razones = [];
		if (aceptado(mejor)) razones.push("bien aceptado por el curso");
		if (g.elige(v, mejor)) razones.push(`${g.nombre(v)} lo había elegido`);
		if (g.elige(mejor, v)) razones.push(`eligió a ${g.nombre(v)}`);
		bancosApoyo.push({
			asientos: [ref(v), ref(mejor)],
			motivo: `Acompañamiento: junto a ${g.nombre(mejor)}${razones.length ? ` (${razones.join(", ")})` : ""}.`
		});
	}
	const restantes = () => [...libre].sort((a, b) => a - b);
	for (const [a, b] of g.paresMutuos) if (libre.has(a) && libre.has(b) && !g.bloqueado(a, b)) {
		libre.delete(a);
		libre.delete(b);
		bancos.push({ asientos: [ref(a), ref(b)] });
	}
	while (libre.size >= 2) {
		const ids = restantes();
		const a = ids[0];
		let mejor = -1;
		let mejorL = NUNCA - 1;
		for (const b of ids.slice(1)) {
			const l = lazo(a, b);
			if (l > mejorL) {
				mejorL = l;
				mejor = b;
			}
		}
		libre.delete(a);
		libre.delete(mejor);
		bancos.push({ asientos: [ref(a), ref(mejor)] });
	}
	if (libre.size === 1) {
		const x = [...libre][0];
		const todos = [...bancosApoyo, ...bancos];
		let destino = todos.find((b) => b.asientos.every((m) => !g.bloqueado(m.id, x))) ?? todos[0];
		let mejor = NUNCA;
		for (const b of todos) {
			const s = b.asientos.reduce((acc, m) => acc + lazo(x, m.id), 0);
			if (s > mejor) {
				mejor = s;
				destino = b;
			}
		}
		if (destino) destino.asientos.push(ref(x));
		else bancos.push({ asientos: [ref(x)] });
	}
	repararBloqueos(bancos.map((b) => b.asientos), g.bloqueado).forEach((asientos, i) => bancos[i].asientos = asientos);
	if (bancosApoyo.length === 0) return bancos;
	const total = bancosApoyo.length + bancos.length;
	const paso = total / bancosApoyo.length;
	const posApoyo = new Set(bancosApoyo.map((_, k) => Math.floor(k * paso + paso / 2)));
	const resultado = [];
	let ia = 0;
	let ib = 0;
	for (let i = 0; i < total; i++) if (posApoyo.has(i) && ia < bancosApoyo.length || ib >= bancos.length) resultado.push(bancosApoyo[ia++]);
	else resultado.push(bancos[ib++]);
	return resultado;
}

export { generarUbicacion as a, generarGruposEquilibrados as g };
//# sourceMappingURL=ubicacion-CUg_2Bmb.js.map
