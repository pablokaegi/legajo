import { e as escape_html, a as ensure_array_like, b as attr, s as stringify, i as attr_style, d as derived } from './dev-Dj5mSuMo.js';

//#region src/lib/components/GraficoBarras.svelte
function GraficoBarras($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { barras, color = "#6366f1", unidad = "", max, vacio = "Sin datos en el período." } = $$props;
		let tope = derived(() => max ?? Math.max(1, ...barras.map((b) => b.valor)));
		if (barras.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm text-gray-500">${escape_html(vacio)}</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-0.5"><!--[-->`);
			const each_array = ensure_array_like(barras);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let b = each_array[$$index];
				$$renderer.push(`<div class="grid grid-cols-[minmax(0,10rem)_1fr_2.5rem] sm:grid-cols-[minmax(0,14rem)_1fr_3rem] items-center gap-2 rounded px-1 py-1 hover:bg-gray-50"${attr("title", `${stringify(b.etiqueta)}: ${stringify(b.valor)}${stringify(unidad ? " " + unidad : "")}${stringify(b.detalle ? " — " + b.detalle : "")}`)}><div class="min-w-0"><p class="text-xs text-gray-800 truncate">${escape_html(b.etiqueta)}</p> `);
				if (b.detalle) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-[10px] text-gray-400 truncate">${escape_html(b.detalle)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <div class="h-3 bg-gray-100 rounded-r"><div class="h-full rounded-r"${attr_style(`width:${stringify(b.valor > 0 ? Math.max(1.5, b.valor / tope() * 100) : 0)}%; background:${stringify(color)}; -webkit-print-color-adjust:exact; print-color-adjust:exact;`)}></div></div> <span class="text-xs text-gray-500 text-right tabular-nums">${escape_html(b.valor)}</span></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/components/GraficoColumnas.svelte
function GraficoColumnas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { puntos, color = "#6366f1", unidad = "" } = $$props;
		let tope = derived(() => Math.max(1, ...puntos.map((p) => p.valor)));
		let iMax = derived(() => puntos.findIndex((p) => p.valor === tope()));
		if (puntos.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm text-gray-500">Sin datos en el período.</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div><div class="flex items-end gap-[2px] h-36 border-b border-gray-300"><!--[-->`);
			const each_array = ensure_array_like(puntos);
			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let p = each_array[i];
				$$renderer.push(`<div class="flex-1 h-full flex flex-col justify-end items-center group"${attr("title", `${stringify(p.etiqueta)}: ${stringify(p.valor)}${stringify(unidad ? " " + unidad : "")}`)}>`);
				if ((i === iMax() || i === puntos.length - 1) && p.valor > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="text-[10px] text-gray-600 tabular-nums mb-0.5">${escape_html(p.valor)}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <div class="w-full max-w-10 rounded-t group-hover:opacity-80"${attr_style(`height:${stringify(p.valor / tope() * 85)}%; min-height:${stringify(p.valor > 0 ? 2 : 0)}px; background:${stringify(color)}; -webkit-print-color-adjust:exact; print-color-adjust:exact;`)}></div></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="flex gap-[2px] mt-1"><!--[-->`);
			const each_array_1 = ensure_array_like(puntos);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let p = each_array_1[$$index_1];
				$$renderer.push(`<span class="flex-1 text-center text-[10px] text-gray-500 truncate">${escape_html(p.etiqueta)}</span>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}

export { GraficoBarras as G, GraficoColumnas as a };
//# sourceMappingURL=GraficoColumnas-BNROrJtL.js.map
