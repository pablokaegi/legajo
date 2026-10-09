import { h as head, b as attr, s as stringify, e as escape_html, a as ensure_array_like, c as attr_class, i as attr_style, d as derived } from './dev-BsmPEhme.js';

//#region src/routes/agrupamientos/[id]/estadisticas/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let sesion = derived(() => data.sesion);
		let stats = derived(() => data.stats);
		let analisis = derived(() => data.analisis);
		let nom = derived(() => stats()?.modo === "nominacion");
		let maxDist = derived(() => stats() ? Math.max(1, ...stats().distribucion.map((d) => d.cantidad)) : 1);
		head("lyjf44", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Estadísticas — ${escape_html(sesion().titulo)}</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-2"><a${attr("href", `/agrupamientos/${stringify(sesion().id)}`)} class="text-indigo-600 text-sm hover:underline">← Panel</a> <h2 class="text-lg font-bold text-gray-900">Estadísticas</h2></div> <div class="card"><p class="text-sm font-semibold text-gray-800">${escape_html(sesion().titulo)}</p> <p class="text-xs text-gray-500">🎓 ${escape_html(sesion().cursoNombre)}</p></div> `);
		if (!stats()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-3xl mb-2">📭</p> <p class="text-gray-500 text-sm">Todavía no hay votos para analizar.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			if (analisis() && analisis().advertencias.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 space-y-1"><!--[-->`);
				const each_array = ensure_array_like(analisis().advertencias);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let adv = each_array[$$index];
					$$renderer.push(`<p class="text-xs text-amber-800">⚠️ ${escape_html(adv)}</p>`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="grid grid-cols-2 sm:grid-cols-4 gap-2"><!--[-->`);
			const each_array_1 = ensure_array_like([
				["Votaron", `${stats().totalVotantes} de ${stats().totalCurso}`],
				["Participación", stats().participacion + "%"],
				[nom() ? "Elecciones" : "Puntajes 4-5", stats().totalElecciones],
				["Pedidos de no quedar juntos", stats().totalBloqueos]
			]);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let [lbl, val] = each_array_1[$$index_1];
				$$renderer.push(`<div class="card text-center"><p class="text-xl font-bold text-indigo-700">${escape_html(val)}</p> <p class="text-xs text-gray-500">${escape_html(lbl)}</p></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">${escape_html(nom() ? "Cuántas elecciones recibió cada alumno" : "Distribución de calificaciones")}</p> <!--[-->`);
			const each_array_2 = ensure_array_like(stats().distribucion);
			for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
				let d = each_array_2[i];
				$$renderer.push(`<div class="flex items-center gap-2"><span class="text-xs text-gray-500 w-24 flex-shrink-0">${escape_html(d.etiqueta)}</span> <div class="flex-1 h-4 bg-gray-100 rounded overflow-hidden"><div${attr_class(`h-full ${stringify(nom() && i === 0 ? "bg-amber-500" : "bg-indigo-500")}`)}${attr_style(`width: ${stringify(d.cantidad / maxDist() * 100)}%`)}></div></div> <span class="text-xs text-gray-500 w-8 text-right">${escape_html(d.cantidad)}</span></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">🏆 Más elegidos por el grupo</p> <!--[-->`);
			const each_array_3 = ensure_array_like(stats().masElegidos.slice(0, 8));
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let a = each_array_3[$$index_3];
				$$renderer.push(`<div class="flex items-center justify-between text-sm"><span class="text-gray-800 truncate">${escape_html(a.nombre)}</span> <span class="text-xs text-gray-500 flex-shrink-0 ml-2">${escape_html(a.recibidas)} de ${escape_html(a.exposicion)} posibles</span></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="grid sm:grid-cols-2 gap-2"><div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">🚫 Pedidos de no quedar juntos</p> `);
			if (stats().masBloqueados.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-sm text-gray-500">Nadie recibió pedidos.</p>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--[-->`);
				const each_array_4 = ensure_array_like(stats().masBloqueados);
				for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
					let b = each_array_4[$$index_4];
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
				const each_array_5 = ensure_array_like(stats().bloqueosMutuos);
				for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
					let bm = each_array_5[$$index_5];
					$$renderer.push(`<p class="text-sm text-gray-800">⚠️ ${escape_html(bm.a.nombre)} ↔ ${escape_html(bm.b.nombre)}</p>`);
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div></div> <div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">💞 Elecciones recíprocas (${escape_html(stats().mutuas.length)})</p> `);
			if (stats().mutuas.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-sm text-gray-500">No hay elecciones recíprocas.</p>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="flex flex-wrap gap-1.5"><!--[-->`);
				const each_array_6 = ensure_array_like(stats().mutuas);
				for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
					let par = each_array_6[$$index_6];
					$$renderer.push(`<span class="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-800">${escape_html(par.a.nombre)} ↔ ${escape_html(par.b.nombre)}</span>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div> `);
			if (analisis()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div${attr_class(`rounded-xl px-4 py-3 text-sm ${stringify(analisis().climaGrupal === "requiere_atencion" ? "bg-amber-50 border border-amber-200 text-amber-800" : "bg-green-50 border border-green-200 text-green-700")}`)}><strong>${escape_html(analisis().climaGrupal === "requiere_atencion" ? "El grupo necesita atención en la integración" : "El grupo presenta una dinámica equilibrada")}</strong> <span class="block text-xs mt-0.5">${escape_html(analisis().porcentajeReciprocidad)}% de las elecciones fueron devueltas · ${escape_html(analisis().clusters.length)} subgrupo(s) de vínculos recíprocos</span></div> <div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">📋 Recomendaciones pedagógicas</p> <p class="text-xs text-gray-500">Sugerencias para trabajar la integración y aprovechar fortalezas, basadas en
          investigación educativa.</p> <!--[-->`);
				const each_array_7 = ensure_array_like(analisis().recomendaciones);
				for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
					let r = each_array_7[$$index_7];
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
					const each_array_8 = ensure_array_like(analisis().paraAcompanar);
					for (let $$index_10 = 0, $$length = each_array_8.length; $$index_10 < $$length; $$index_10++) {
						let a = each_array_8[$$index_10];
						$$renderer.push(`<div class="rounded-lg border border-gray-200 p-3 space-y-1.5"><p class="text-sm font-semibold text-gray-800">${escape_html(a.nombre)}</p> <ul class="space-y-0.5"><!--[-->`);
						const each_array_9 = ensure_array_like(a.observaciones);
						for (let $$index_8 = 0, $$length = each_array_9.length; $$index_8 < $$length; $$index_8++) {
							let o = each_array_9[$$index_8];
							$$renderer.push(`<li class="text-xs text-gray-500">• ${escape_html(o)}</li>`);
						}
						$$renderer.push(`<!--]--></ul> <div class="bg-indigo-50 rounded-lg p-2 space-y-0.5"><p class="text-xs font-medium text-indigo-700">Qué se puede hacer:</p> <!--[-->`);
						const each_array_10 = ensure_array_like(a.sugerencias);
						for (let $$index_9 = 0, $$length = each_array_10.length; $$index_9 < $$length; $$index_9++) {
							let s = each_array_10[$$index_9];
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
					const each_array_11 = ensure_array_like(analisis().referentes);
					for (let $$index_11 = 0, $$length = each_array_11.length; $$index_11 < $$length; $$index_11++) {
						let r = each_array_11[$$index_11];
						$$renderer.push(`<div class="text-sm"><span class="font-medium text-gray-800">${escape_html(r.nombre)}</span> <span class="text-xs text-gray-500">— ${escape_html(r.cualidades.join(" · "))}</span></div>`);
					}
					$$renderer.push(`<!--]--></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (analisis().clusters.length > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">👥 Subgrupos de vínculos recíprocos</p> <p class="text-xs text-gray-500">Alumnos conectados por elecciones devueltas. La densidad indica qué parte de los pares del subgrupo se eligieron mutuamente.</p> <!--[-->`);
					const each_array_12 = ensure_array_like(analisis().clusters);
					for (let i = 0, $$length = each_array_12.length; i < $$length; i++) {
						let c = each_array_12[i];
						$$renderer.push(`<p class="text-sm text-gray-800"><span class="text-xs text-gray-400">S${escape_html(i + 1)} (${escape_html(c.miembros.length)} · densidad ${escape_html(c.densidad)}%):</span> ${escape_html(c.miembros.map((m) => m.nombre).join(", "))}</p>`);
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
				const each_array_13 = ensure_array_like(data.conducta);
				for (let $$index_13 = 0, $$length = each_array_13.length; $$index_13 < $$length; $$index_13++) {
					let c = each_array_13[$$index_13];
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
//# sourceMappingURL=_page.svelte-Bxb-cR_q.js.map
