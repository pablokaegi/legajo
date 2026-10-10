import { h as head, e as escape_html, a as ensure_array_like, b as attr, s as stringify, c as attr_class, d as derived } from './dev-Dj5mSuMo.js';

//#region src/routes/agrupamientos/curso/[cursoId]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const MODO_LBL = {
			afinidad: "🤝 Afinidad",
			heterogeneo: "⚖️ Heterogéneo",
			rendimiento: "📚 Rendimiento",
			aleatorio: "🎲 Aleatorio",
			manual: "✋ Manual",
			ubicacion: "🪑 Ubicación",
			tutoria: "🧑‍🏫 Tutoría"
		};
		const TENDENCIA = {
			sostenida: {
				lbl: "⚠️ Atención sostenida",
				cls: "text-red-700"
			},
			empeora: {
				lbl: "↘ Perdió vínculos",
				cls: "text-amber-700"
			},
			mejora: {
				lbl: "↗ Mejora",
				cls: "text-green-700"
			}
		};
		let sostenidos = derived(() => data.alumnos.filter((a) => a.tendencia === "sostenida").length);
		head("14hktbx", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Evolución — ${escape_html(data.cursoNombre)}</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-2"><a href="/agrupamientos" class="text-indigo-600 text-sm hover:underline">← Agrupamientos</a> <h2 class="text-lg font-bold text-gray-900">Evolución del curso</h2></div> <div class="card"><p class="text-sm font-semibold text-gray-800">🎓 ${escape_html(data.cursoNombre)}</p> <p class="text-xs text-gray-500">${escape_html(data.columnas.length)} votación(es). Una sola foto puede engañar; lo que más importa es la baja aceptación
      que se repite en el tiempo. — Parker &amp; Asher (1987).</p></div> `);
		if (sostenidos() > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-3 py-2">${escape_html(sostenidos())} alumno(s) aparecen para acompañar en al menos 2 de las últimas 3 votaciones: conviene
      priorizarlos (ubicación, roles visibles, conversación con el equipo de orientación).</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="card overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-xs text-gray-500 border-b border-gray-200"><th class="text-left font-medium py-1.5">Votación</th><th class="text-center font-medium py-1.5">Particip.</th><th class="text-center font-medium py-1.5">Recíprocas</th><th class="text-center font-medium py-1.5">Sin elecciones</th><th class="text-center font-medium py-1.5">A acompañar</th></tr></thead><tbody><!--[-->`);
		const each_array = ensure_array_like(data.columnas);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let c = each_array[$$index];
			$$renderer.push(`<tr class="border-b border-gray-100"><td class="py-1.5"><a${attr("href", `/agrupamientos/${stringify(c.id)}/estadisticas`)} class="text-indigo-700 hover:underline">${escape_html(c.titulo)}</a> <span class="block text-xs text-gray-400">${escape_html(c.fecha)}${escape_html(c.modo !== "nominacion" ? " · formato anterior" : "")}${escape_html(c.clima === "requiere_atencion" ? " · ⚠️ clima" : "")}</span></td><td class="text-center text-gray-600">${escape_html(c.participacion)}%</td><td class="text-center text-gray-600">${escape_html(c.reciprocidad)}%</td><td${attr_class(`text-center ${stringify(c.sinElecciones ? "text-amber-700" : "text-gray-400")}`)}>${escape_html(c.sinElecciones)}</td><td${attr_class(`text-center ${stringify(c.acompanar ? "text-amber-700" : "text-gray-400")}`)}>${escape_html(c.acompanar)}</td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table></div> <div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">Alumno por alumno</p> <p class="text-xs text-gray-500">Cada celda: elecciones recibidas / compañeros que podían elegirlo. En ámbar, las votaciones en que
      convenía acompañarlo.</p> <div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-xs text-gray-500 border-b border-gray-200"><th class="text-left font-medium py-1.5">Alumno</th><!--[-->`);
		const each_array_1 = ensure_array_like(data.columnas);
		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let c = each_array_1[i];
			$$renderer.push(`<th class="text-center font-medium py-1.5"${attr("title", c.titulo)}>#${escape_html(i + 1)}</th>`);
		}
		$$renderer.push(`<!--]--><th class="text-left font-medium py-1.5">Tendencia</th></tr></thead><tbody><!--[-->`);
		const each_array_2 = ensure_array_like(data.alumnos);
		for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
			let a = each_array_2[$$index_3];
			$$renderer.push(`<tr class="border-b border-gray-100"><td class="py-1.5 text-gray-800 whitespace-nowrap">${escape_html(a.nombre)}</td><!--[-->`);
			const each_array_3 = ensure_array_like(a.fila);
			for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
				let celda = each_array_3[$$index_2];
				$$renderer.push(`<td${attr_class(`text-center text-xs ${stringify(celda?.acompanar ? "bg-amber-100 text-amber-900 font-semibold" : "text-gray-600")}`)}>${escape_html(celda ? `${celda.recibidas}/${celda.exposicion}` : "—")}</td>`);
			}
			$$renderer.push(`<!--]--><td${attr_class(`text-xs whitespace-nowrap ${stringify(a.tendencia ? TENDENCIA[a.tendencia].cls : "")}`)}>${escape_html(a.tendencia ? TENDENCIA[a.tendencia].lbl : "")}</td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table></div></div> `);
		if (data.evaluaciones.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">Qué te funcionó en este curso</p> <p class="text-xs text-gray-500">Según cómo evaluaste las agrupaciones guardadas.</p> <!--[-->`);
			const each_array_4 = ensure_array_like(data.evaluaciones);
			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let e = each_array_4[$$index_4];
				$$renderer.push(`<div class="flex items-center justify-between text-sm"><span class="text-gray-800">${escape_html(MODO_LBL[e.modo] ?? e.modo)}</span> <span class="text-xs text-gray-600">👍 ${escape_html(e.funciono)} · 😐 ${escape_html(e.regular)} · 👎 ${escape_html(e.no_funciono)}${escape_html(e.sinEvaluar ? ` · ${e.sinEvaluar} sin evaluar` : "")}</span></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Xq7VrJpQ.js.map
