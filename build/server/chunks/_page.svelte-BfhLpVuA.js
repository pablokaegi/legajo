import { h as head, b as attr, s as stringify, e as escape_html, a as ensure_array_like, c as attr_class, i as attr_style, d as derived } from './dev-BsmPEhme.js';

//#region src/routes/institucional/agrupamientos/[id]/estadisticas/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let sesion = derived(() => data.sesion);
		let stats = derived(() => data.stats);
		let analisis = derived(() => data.analisis);
		function colorRiesgo(n) {
			if (n >= 5) return "bg-red-100 text-red-700 border-red-200";
			if (n >= 3) return "bg-orange-100 text-orange-700 border-orange-200";
			return "bg-yellow-100 text-yellow-700 border-yellow-200";
		}
		const PUNTAJE_COLOR = {
			1: "bg-red-500",
			2: "bg-orange-500",
			3: "bg-yellow-500",
			4: "bg-teal-500",
			5: "bg-green-600"
		};
		let maxDist = derived(() => stats() ? Math.max(1, ...Object.values(stats().distribucion)) : 1);
		head("w8mbn3", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Estadísticas — ${escape_html(sesion().titulo)}</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-2"><a${attr("href", `/institucional/agrupamientos/${stringify(sesion().id)}`)} class="text-indigo-600 text-sm hover:underline">← Panel</a> <h2 class="text-lg font-bold text-gray-900">Estadísticas</h2></div> <div class="card"><p class="text-sm font-semibold text-gray-800">${escape_html(sesion().titulo)}</p> <p class="text-xs text-gray-500">🎓 ${escape_html(sesion().cursoNombre)}</p></div> `);
		if (!stats()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-3xl mb-2">📭</p> <p class="text-gray-500 text-sm">Todavía no hay votos para analizar.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="grid grid-cols-2 sm:grid-cols-4 gap-2"><!--[-->`);
			const each_array = ensure_array_like([
				["Votaron", stats().totalVotantes],
				["Participación", stats().participacion + "%"],
				["Calificaciones", stats().totalRatings],
				["Bloqueos", stats().totalBloqueos]
			]);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let [lbl, val] = each_array[$$index];
				$$renderer.push(`<div class="card text-center"><p class="text-xl font-bold text-indigo-700">${escape_html(val)}</p> <p class="text-xs text-gray-500">${escape_html(lbl)}</p></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">Distribución de calificaciones</p> <!--[-->`);
			const each_array_1 = ensure_array_like([
				5,
				4,
				3,
				2,
				1
			]);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let p = each_array_1[$$index_1];
				$$renderer.push(`<div class="flex items-center gap-2"><span class="text-xs text-gray-500 w-3">${escape_html(p)}</span> <div class="flex-1 h-4 bg-gray-100 rounded overflow-hidden"><div${attr_class(`h-full ${stringify(PUNTAJE_COLOR[p])}`)}${attr_style(`width: ${stringify(stats().distribucion[p] / maxDist() * 100)}%`)}></div></div> <span class="text-xs text-gray-500 w-8 text-right">${escape_html(stats().distribucion[p])}</span></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="grid sm:grid-cols-2 gap-2"><div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">🏆 Mejor valorados</p> <!--[-->`);
			const each_array_2 = ensure_array_like(stats().populares.slice(0, 8));
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let a = each_array_2[$$index_2];
				$$renderer.push(`<div class="flex items-center justify-between text-sm"><span class="text-gray-800 truncate">${escape_html(a.nombre)}</span> <span class="text-xs text-gray-500 flex-shrink-0 ml-2">⭐ ${escape_html(a.promedio)} · ${escape_html(a.totalVotos)} votos</span></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">⚠️ Menos valorados</p> <!--[-->`);
			const each_array_3 = ensure_array_like(stats().populares.slice(-5).reverse());
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let a = each_array_3[$$index_3];
				$$renderer.push(`<div class="flex items-center justify-between text-sm"><span class="text-gray-800 truncate">${escape_html(a.nombre)}</span> <span class="text-xs text-gray-500 flex-shrink-0 ml-2">⭐ ${escape_html(a.promedio)} · ${escape_html(a.totalVotos)} votos</span></div>`);
			}
			$$renderer.push(`<!--]--></div></div> <div class="grid sm:grid-cols-2 gap-2"><div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">🚫 Más bloqueados</p> `);
			if (stats().masBloqueados.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-sm text-gray-500">Nadie fue bloqueado.</p>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--[-->`);
				const each_array_4 = ensure_array_like(stats().masBloqueados);
				for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
					let b = each_array_4[$$index_4];
					$$renderer.push(`<div class="flex items-center justify-between text-sm"><span class="text-gray-800 truncate">${escape_html(b.nombre)}</span> <span class="text-xs text-red-500 flex-shrink-0 ml-2">${escape_html(b.cantidad)} bloqueo(s)</span></div>`);
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div> <div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">💥 Bloqueos mutuos</p> `);
			if (stats().bloqueosMutuos.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-sm text-gray-500">No hay conflictos mutuos.</p>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--[-->`);
				const each_array_5 = ensure_array_like(stats().bloqueosMutuos);
				for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
					let bm = each_array_5[$$index_5];
					$$renderer.push(`<p class="text-sm text-gray-800">⚠️ ${escape_html(bm.a.nombre)} ↔ ${escape_html(bm.b.nombre)}</p>`);
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div></div> <div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">💞 Mejores afinidades mutuas</p> `);
			if (stats().mejoresAfinidades.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-sm text-gray-500">No hay afinidades mutuas.</p>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--[-->`);
				const each_array_6 = ensure_array_like(stats().mejoresAfinidades.slice(0, 10));
				for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
					let af = each_array_6[$$index_6];
					$$renderer.push(`<div class="flex items-center justify-between text-sm"><span class="text-gray-800 truncate">${escape_html(af.a.nombre)} ↔ ${escape_html(af.b.nombre)}</span> <span class="text-xs text-indigo-600 flex-shrink-0 ml-2">⭐ ${escape_html(af.promedio)}</span></div>`);
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div> `);
			if (analisis()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div${attr_class(`rounded-xl px-4 py-3 text-sm ${stringify(analisis().nivelAlerta === "ALTO" ? "bg-red-50 border border-red-200 text-red-700" : "bg-green-50 border border-green-200 text-green-700")}`)}><strong>Análisis psicopedagógico — alerta: ${escape_html(analisis().nivelAlerta)}</strong> <span class="block text-xs mt-0.5">${escape_html(analisis().porcentajeReciprocidad)}% de relaciones recíprocas · ${escape_html(analisis().clusters.length)} grupo(s) social(es)</span></div> <div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">📋 Recomendaciones</p> <ul class="space-y-1.5"><!--[-->`);
				const each_array_7 = ensure_array_like(analisis().recomendaciones);
				for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
					let r = each_array_7[$$index_7];
					$$renderer.push(`<li class="text-sm text-gray-700 flex gap-2"><span class="text-indigo-500">•</span><span>${escape_html(r)}</span></li>`);
				}
				$$renderer.push(`<!--]--></ul></div> <div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">⚠️ Alumnos en riesgo de aislamiento (${escape_html(analisis().riesgo.length)})</p> `);
				if (analisis().riesgo.length === 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-sm text-gray-500">Sin alumnos en riesgo.</p>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--[-->`);
					const each_array_8 = ensure_array_like(analisis().riesgo);
					for (let $$index_9 = 0, $$length = each_array_8.length; $$index_9 < $$length; $$index_9++) {
						let r = each_array_8[$$index_9];
						$$renderer.push(`<div${attr_class(`rounded-lg border p-2.5 ${stringify(colorRiesgo(r.nivelRiesgo))}`)}><div class="flex items-center justify-between"><span class="text-sm font-semibold">${escape_html(r.nombre)}</span> <span class="text-xs">riesgo ${escape_html(r.nivelRiesgo)}/5</span></div> <ul class="mt-1 space-y-0.5"><!--[-->`);
						const each_array_9 = ensure_array_like(r.factores);
						for (let $$index_8 = 0, $$length = each_array_9.length; $$index_8 < $$length; $$index_8++) {
							let f = each_array_9[$$index_8];
							$$renderer.push(`<li class="text-xs">• ${escape_html(f)}</li>`);
						}
						$$renderer.push(`<!--]--></ul></div>`);
					}
					$$renderer.push(`<!--]-->`);
				}
				$$renderer.push(`<!--]--></div> `);
				if (analisis().lideres.length > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">⭐ Líderes potenciales</p> <!--[-->`);
					const each_array_10 = ensure_array_like(analisis().lideres);
					for (let $$index_10 = 0, $$length = each_array_10.length; $$index_10 < $$length; $$index_10++) {
						let l = each_array_10[$$index_10];
						$$renderer.push(`<div class="text-sm"><span class="font-medium text-gray-800">${escape_html(l.nombre)}</span> <span class="text-xs text-gray-500">— ${escape_html(l.cualidades.join(" · "))}</span></div>`);
					}
					$$renderer.push(`<!--]--></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (analisis().clusters.length > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">👥 Grupos sociales detectados</p> <!--[-->`);
					const each_array_11 = ensure_array_like(analisis().clusters);
					for (let i = 0, $$length = each_array_11.length; i < $$length; i++) {
						let c = each_array_11[i];
						$$renderer.push(`<p class="text-sm text-gray-800"><span class="text-xs text-gray-400">G${escape_html(i + 1)} (cohesión ${escape_html(c.cohesion)}):</span> ${escape_html(c.miembros.map((m) => m.nombre).join(", "))}</p>`);
					}
					$$renderer.push(`<!--]--></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BfhLpVuA.js.map
