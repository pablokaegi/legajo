import { h as head, b as attr, s as stringify, a as ensure_array_like, e as escape_html, d as derived } from './dev-Dj5mSuMo.js';
import { E as EncabezadoInforme } from './EncabezadoInforme-laulOR_S.js';
import { G as GraficoBarras, a as GraficoColumnas } from './GraficoColumnas-BNROrJtL.js';
import './institucional-Ccb6xWsP.js';

//#region src/routes/gabinete/informe/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let e = derived(() => data.e);
		const fmt = (f) => (/* @__PURE__ */ new Date(f + "T12:00:00")).toLocaleDateString("es-AR");
		let comentario = "";
		head("spm9zl", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Informe institucional — Gabinete</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex flex-wrap gap-3 items-center print:hidden"><a${attr("href", `/gabinete/estadisticas?desde=${stringify(e().desde)}&hasta=${stringify(e().hasta)}`)} class="text-indigo-600 text-sm hover:underline">← Estadísticas</a> <button class="btn-primary text-sm ml-auto">🖨️ Imprimir / Guardar PDF</button></div> <p class="text-xs text-gray-500 print:hidden">En el diálogo de impresión elegí "Guardar como PDF". Este informe tiene solo datos agregados: no incluye nombres de alumnos.</p> <article class="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 space-y-5 print:border-0 print:p-0">`);
		EncabezadoInforme($$renderer, {
			titulo: "Informe del Gabinete Psicopedagógico",
			subtitulo: `Período: ${stringify(fmt(e().desde))} al ${stringify(fmt(e().hasta))}`
		});
		$$renderer.push(`<!----> <section class="space-y-2"><h2 class="text-sm font-bold text-gray-900">1. Resumen</h2> <table class="w-full text-sm"><tbody><!--[-->`);
		const each_array = ensure_array_like([
			["Casos abiertos en el período", e().casosNuevos],
			["Casos cerrados en el período", e().casosCerrados],
			["Casos activos a la fecha", e().activosHoy],
			["Derivaciones de docentes y preceptoría", e().derivacionesDocentes],
			["Intervenciones registradas", e().totalIntervenciones],
			["Días hasta la primera intervención (mediana)", e().medianaDiasPrimeraIntervencion ?? "—"],
			["Casos con situaciones de protocolo", e().urgentes]
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [k, v] = each_array[$$index];
			$$renderer.push(`<tr class="border-b border-gray-100"><td class="py-1 text-gray-700">${escape_html(k)}</td><td class="py-1 text-right tabular-nums font-medium">${escape_html(v)}</td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table></section> <section class="space-y-2 break-inside-avoid"><h2 class="text-sm font-bold text-gray-900">2. Motivos de intervención</h2> `);
		GraficoBarras($$renderer, {
			barras: e().porGrupo,
			unidad: "casos",
			color: "#4f46e5"
		});
		$$renderer.push(`<!----> <div class="grid grid-cols-2 gap-x-6 gap-y-2 pt-2"><!--[-->`);
		const each_array_1 = ensure_array_like(e().porCategoria.filter((g) => g.barras.length > 0));
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let g = each_array_1[$$index_1];
			$$renderer.push(`<div><p class="text-xs font-medium text-gray-700">${escape_html(g.grupo)}</p> `);
			GraficoBarras($$renderer, {
				barras: g.barras,
				unidad: "casos",
				color: "#818cf8"
			});
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]--></div></section> <section class="space-y-2 break-inside-avoid"><h2 class="text-sm font-bold text-gray-900">3. Cursos</h2> `);
		GraficoBarras($$renderer, {
			barras: e().porCurso,
			unidad: "casos"
		});
		$$renderer.push(`<!----></section> <section class="space-y-2 break-inside-avoid"><h2 class="text-sm font-bold text-gray-900">4. Intervenciones</h2> `);
		GraficoColumnas($$renderer, {
			puntos: e().intervencionesPorMes,
			unidad: "intervenciones"
		});
		$$renderer.push(`<!----> `);
		GraficoBarras($$renderer, {
			barras: e().intervencionesPorTipo,
			unidad: "registros"
		});
		$$renderer.push(`<!----></section> <section class="space-y-2 break-inside-avoid"><h2 class="text-sm font-bold text-gray-900">5. Niveles de apoyo y estado</h2> <div class="grid grid-cols-2 gap-4">`);
		GraficoBarras($$renderer, {
			barras: e().porNivel,
			unidad: "casos"
		});
		$$renderer.push(`<!----> `);
		GraficoBarras($$renderer, {
			barras: e().porEstado,
			unidad: "casos"
		});
		$$renderer.push(`<!----></div> <p class="text-[11px] text-gray-500">Nivel 1: apoyo universal · Nivel 2: apoyo focalizado · Nivel 3: apoyo intensivo e individual
        (modelo de apoyos escalonados, Fuchs &amp; Fuchs, 2006).</p></section> <section class="space-y-2 break-inside-avoid"><h2 class="text-sm font-bold text-gray-900">6. Observaciones y propuestas del gabinete</h2> <textarea rows="4" class="form-input text-sm print:hidden" placeholder="Lectura del período, necesidades detectadas, propuestas para el equipo directivo…">`);
		const $$body = escape_html(comentario);
		if ($$body) $$renderer.push(`${$$body}`);
		$$renderer.push(`</textarea> <p class="hidden print:block text-sm text-gray-800 whitespace-pre-line min-h-16">${escape_html(comentario)}</p></section> <div class="grid grid-cols-2 gap-10 pt-12 text-center text-xs text-gray-600"><div class="border-t border-gray-400 pt-1">Gabinete psicopedagógico<br/>${escape_html(data.emisor)}</div> <div class="border-t border-gray-400 pt-1">Dirección</div></div></article></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DUk25HWa.js.map
