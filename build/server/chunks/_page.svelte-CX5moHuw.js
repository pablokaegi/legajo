import { h as head, b as attr, s as stringify, e as escape_html, a as ensure_array_like, i as attr_style, d as derived } from './dev-Dj5mSuMo.js';
import './client2-BLuH5cYu.js';
import { G as GraficoBarras, a as GraficoColumnas } from './GraficoColumnas-BNROrJtL.js';
import './internal-DGke0biV.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/gabinete/estadisticas/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let e = derived(() => data.e);
		let desde = data.e.desde;
		let hasta = data.e.hasta;
		const q = derived(() => `desde=${e().desde}&hasta=${e().hasta}`);
		const fmt = (f) => (/* @__PURE__ */ new Date(f + "T12:00:00")).toLocaleDateString("es-AR");
		let maxCat = derived(() => Math.max(1, ...e().porCategoria.flatMap((g) => g.barras.map((b) => b.valor))));
		head("ptpc5k", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Estadísticas — Gabinete</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="card flex flex-wrap items-end gap-2"><div><label class="form-label" for="desde">Desde</label> <input id="desde" type="date"${attr("value", desde)} class="form-input text-sm"/></div> <div><label class="form-label" for="hasta">Hasta</label> <input id="hasta" type="date"${attr("value", hasta)} class="form-input text-sm"/></div> <button class="btn-primary text-sm">Aplicar</button> <div class="ml-auto flex flex-wrap gap-3 text-xs"><a${attr("href", `/gabinete/informe?${stringify(q())}`)} class="text-indigo-700 hover:underline">📄 Informe institucional</a> <a${attr("href", `/gabinete/estadisticas/csv?${stringify(q())}`)} class="text-indigo-700 hover:underline" data-sveltekit-reload="">⬇️ CSV</a></div></div> <p class="text-xs text-gray-500">Período: ${escape_html(fmt(e().desde))} al ${escape_html(fmt(e().hasta))} · casos abiertos en el período.</p> <div class="grid grid-cols-2 sm:grid-cols-4 gap-2"><!--[-->`);
		const each_array = ensure_array_like([
			[
				"Casos nuevos",
				e().casosNuevos,
				""
			],
			[
				"Intervenciones",
				e().totalIntervenciones,
				""
			],
			[
				"Activos hoy",
				e().activosHoy,
				""
			],
			[
				"Días hasta la 1.ª intervención",
				e().medianaDiasPrimeraIntervencion ?? "—",
				"mediana"
			]
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [lbl, val, sub] = each_array[$$index];
			$$renderer.push(`<div class="card text-center"><p class="text-2xl font-bold text-gray-900 tabular-nums">${escape_html(val)}</p> <p class="text-xs text-gray-500">${escape_html(lbl)}${escape_html(sub ? ` (${sub})` : "")}</p></div>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (e().urgentes > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-xs bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2">⚠️ ${escape_html(e().urgentes)} caso(s) del período con categoría urgente (protocolo).</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="card space-y-3"><div><p class="text-sm font-semibold text-gray-800">Motivos de los casos</p> <p class="text-xs text-gray-500">Un caso puede tener más de un motivo.</p></div> `);
		GraficoBarras($$renderer, {
			barras: e().porGrupo,
			unidad: "casos",
			color: "#4f46e5"
		});
		$$renderer.push(`<!----> <div class="grid sm:grid-cols-2 gap-x-6 gap-y-3 pt-2 border-t border-gray-100"><!--[-->`);
		const each_array_1 = ensure_array_like(e().porCategoria.filter((g) => g.barras.length > 0));
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let g = each_array_1[$$index_1];
			$$renderer.push(`<div class="space-y-1"><p class="text-xs font-medium text-gray-700 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full inline-block"${attr_style(`background:${stringify(g.color)}`)}></span>${escape_html(g.grupo)}</p> `);
			GraficoBarras($$renderer, {
				barras: g.barras,
				unidad: "casos",
				max: maxCat(),
				color: "#818cf8"
			});
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">Cursos con más casos</p> `);
		GraficoBarras($$renderer, {
			barras: e().porCurso.slice(0, 12),
			unidad: "casos"
		});
		$$renderer.push(`<!----> `);
		if (e().porCurso.length > 12) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-xs text-gray-400">y ${escape_html(e().porCurso.length - 12)} curso(s) más (ver CSV).</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="card space-y-3"><p class="text-sm font-semibold text-gray-800">Intervenciones por mes</p> `);
		GraficoColumnas($$renderer, {
			puntos: e().intervencionesPorMes,
			unidad: "intervenciones"
		});
		$$renderer.push(`<!----> <p class="text-sm font-semibold text-gray-800 pt-2">Tipo de intervención</p> `);
		GraficoBarras($$renderer, {
			barras: e().intervencionesPorTipo,
			unidad: "registros"
		});
		$$renderer.push(`<!----></div> <div class="grid sm:grid-cols-3 gap-2"><!--[-->`);
		const each_array_2 = ensure_array_like([
			["Nivel de apoyo", e().porNivel],
			["Estado actual", e().porEstado],
			["Cómo llegaron", e().porOrigen]
		]);
		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let [titulo, barras] = each_array_2[$$index_2];
			$$renderer.push(`<div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">${escape_html(titulo)}</p> `);
			GraficoBarras($$renderer, {
				barras,
				unidad: "casos"
			});
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CX5moHuw.js.map
