import { h as head, b as attr, s as stringify, e as escape_html, a as ensure_array_like, c as attr_class, i as attr_style, d as derived } from './dev-BsmPEhme.js';

//#region src/routes/institucional/agrupamientos/[id]/estadisticas/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let sesion = derived(() => data.sesion);
		let stats = derived(() => data.stats);
		let analisis = derived(() => data.analisis);
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
			$$renderer.push(`<!--]--></div> <div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">🏆 Mejor valorados por el grupo</p> <!--[-->`);
			const each_array_2 = ensure_array_like(stats().populares.slice(0, 8));
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let a = each_array_2[$$index_2];
				$$renderer.push(`<div class="flex items-center justify-between text-sm"><span class="text-gray-800 truncate">${escape_html(a.nombre)}</span> <span class="text-xs text-gray-500 flex-shrink-0 ml-2">⭐ ${escape_html(a.promedio)} · ${escape_html(a.totalVotos)} votos</span></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="grid sm:grid-cols-2 gap-2"><div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">🚫 Pedidos de no quedar juntos</p> `);
			if (stats().masBloqueados.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-sm text-gray-500">Nadie recibió pedidos.</p>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--[-->`);
				const each_array_3 = ensure_array_like(stats().masBloqueados);
				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let b = each_array_3[$$index_3];
					$$renderer.push(`<div class="flex items-center justify-between text-sm"><span class="text-gray-800 truncate">${escape_html(b.nombre)}</span> <span class="text-xs text-gray-500 flex-shrink-0 ml-2">${escape_html(b.cantidad)}</span></div>`);
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div> <div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">💥 Incompatibilidades mutuas</p> `);
			if (stats().bloqueosMutuos.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-sm text-gray-500">No hay conflictos mutuos.</p>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--[-->`);
				const each_array_4 = ensure_array_like(stats().bloqueosMutuos);
				for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
					let bm = each_array_4[$$index_4];
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
				const each_array_5 = ensure_array_like(stats().mejoresAfinidades.slice(0, 10));
				for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
					let af = each_array_5[$$index_5];
					$$renderer.push(`<div class="flex items-center justify-between text-sm"><span class="text-gray-800 truncate">${escape_html(af.a.nombre)} ↔ ${escape_html(af.b.nombre)}</span> <span class="text-xs text-indigo-600 flex-shrink-0 ml-2">⭐ ${escape_html(af.promedio)}</span></div>`);
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div> `);
			if (analisis()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div${attr_class(`rounded-xl px-4 py-3 text-sm ${stringify(analisis().climaGrupal === "requiere_atencion" ? "bg-amber-50 border border-amber-200 text-amber-800" : "bg-green-50 border border-green-200 text-green-700")}`)}><strong>${escape_html(analisis().climaGrupal === "requiere_atencion" ? "El grupo necesita atención en la integración" : "El grupo presenta una dinámica equilibrada")}</strong> <span class="block text-xs mt-0.5">${escape_html(analisis().porcentajeReciprocidad)}% de relaciones recíprocas · ${escape_html(analisis().clusters.length)} grupo(s) de afinidad</span></div> <div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">📋 Recomendaciones pedagógicas</p> <p class="text-xs text-gray-500">Sugerencias para trabajar la integración y aprovechar fortalezas, basadas en
          investigación educativa.</p> <!--[-->`);
				const each_array_6 = ensure_array_like(analisis().recomendaciones);
				for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
					let r = each_array_6[$$index_6];
					$$renderer.push(`<div class="border-l-2 border-indigo-300 pl-3 py-1"><p class="text-sm text-gray-700">${escape_html(r.texto)}</p> <p class="text-xs text-gray-400 mt-0.5">📚 ${escape_html(r.fundamento)}</p></div>`);
				}
				$$renderer.push(`<!--]--></div> <div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">🤝 Alumnos para acompañar en la integración</p> `);
				if (analisis().paraAcompanar.length === 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-sm text-gray-500">Todos los alumnos están bien integrados según esta votación.</p>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<p class="text-xs text-gray-500">No son etiquetas: es una foto del momento. La idea es darles más oportunidades
            de vincularse y mostrar sus fortalezas.</p> <!--[-->`);
					const each_array_7 = ensure_array_like(analisis().paraAcompanar);
					for (let $$index_9 = 0, $$length = each_array_7.length; $$index_9 < $$length; $$index_9++) {
						let a = each_array_7[$$index_9];
						$$renderer.push(`<div class="rounded-lg border border-gray-200 p-3 space-y-1.5"><p class="text-sm font-semibold text-gray-800">${escape_html(a.nombre)}</p> <ul class="space-y-0.5"><!--[-->`);
						const each_array_8 = ensure_array_like(a.observaciones);
						for (let $$index_7 = 0, $$length = each_array_8.length; $$index_7 < $$length; $$index_7++) {
							let o = each_array_8[$$index_7];
							$$renderer.push(`<li class="text-xs text-gray-500">• ${escape_html(o)}</li>`);
						}
						$$renderer.push(`<!--]--></ul> <div class="bg-indigo-50 rounded-lg p-2 space-y-0.5"><p class="text-xs font-medium text-indigo-700">Qué se puede hacer:</p> <!--[-->`);
						const each_array_9 = ensure_array_like(a.sugerencias);
						for (let $$index_8 = 0, $$length = each_array_9.length; $$index_8 < $$length; $$index_8++) {
							let s = each_array_9[$$index_8];
							$$renderer.push(`<p class="text-xs text-indigo-800">→ ${escape_html(s)}</p>`);
						}
						$$renderer.push(`<!--]--></div></div>`);
					}
					$$renderer.push(`<!--]-->`);
				}
				$$renderer.push(`<!--]--></div> `);
				if (analisis().referentes.length > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">⭐ Mejor reconocimiento del grupo</p> <p class="text-xs text-gray-500">Pueden ser un buen apoyo para acompañar a sus compañeros.</p> <!--[-->`);
					const each_array_10 = ensure_array_like(analisis().referentes);
					for (let $$index_10 = 0, $$length = each_array_10.length; $$index_10 < $$length; $$index_10++) {
						let r = each_array_10[$$index_10];
						$$renderer.push(`<div class="text-sm"><span class="font-medium text-gray-800">${escape_html(r.nombre)}</span> <span class="text-xs text-gray-500">— ${escape_html(r.cualidades.join(" · "))}</span></div>`);
					}
					$$renderer.push(`<!--]--></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (analisis().clusters.length > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">👥 Grupos de afinidad detectados</p> <!--[-->`);
					const each_array_11 = ensure_array_like(analisis().clusters);
					for (let i = 0, $$length = each_array_11.length; i < $$length; i++) {
						let c = each_array_11[i];
						$$renderer.push(`<p class="text-sm text-gray-800"><span class="text-xs text-gray-400">G${escape_html(i + 1)} (cohesión ${escape_html(c.cohesion)}):</span> ${escape_html(c.miembros.map((m) => m.nombre).join(", "))}</p>`);
					}
					$$renderer.push(`<!--]--></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (data.conducta.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">👤 Perfil de conducta del curso</p> <p class="text-xs text-gray-500">Datos de legajo (observaciones, faltas, amonestaciones). Sirven, junto con la
          votación y las notas, para armar grupos más equilibrados.</p> <div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-xs text-gray-500 border-b border-gray-200"><th class="text-left font-medium py-1.5">Alumno</th><th class="text-center font-medium py-1.5">Actitud</th><th class="text-center font-medium py-1.5">Particip.</th><th class="text-center font-medium py-1.5">Tareas</th><th class="text-center font-medium py-1.5">Faltas</th><th class="text-center font-medium py-1.5">Amonest.</th></tr></thead><tbody><!--[-->`);
				const each_array_12 = ensure_array_like(data.conducta);
				for (let $$index_12 = 0, $$length = each_array_12.length; $$index_12 < $$length; $$index_12++) {
					let c = each_array_12[$$index_12];
					$$renderer.push(`<tr class="border-b border-gray-100"><td class="py-1.5 text-gray-800">${escape_html(c.nombre)}</td><td class="py-1.5 text-center text-gray-600">${escape_html(c.actitud ?? "—")}</td><td class="py-1.5 text-center text-gray-600">${escape_html(c.participacion ?? "—")}</td><td class="py-1.5 text-center text-gray-600">${escape_html(c.tareasOk != null ? c.tareasOk + "%" : "—")}</td><td${attr_class(`py-1.5 text-center ${stringify(c.faltas ? "text-amber-600" : "text-gray-400")}`)}>${escape_html(c.faltas)}</td><td${attr_class(`py-1.5 text-center ${stringify(c.amonestaciones ? "text-red-600" : "text-gray-400")}`)}>${escape_html(c.amonestaciones)}</td></tr>`);
				}
				$$renderer.push(`<!--]--></tbody></table></div></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-4xEfYLS8.js.map
