import { a as ensure_array_like, b as attr, i as attr_style, s as stringify, e as escape_html, j as bind_props, d as derived } from './dev-Dj5mSuMo.js';
import { a as CATEGORIA_POR_ID, C as CATEGORIAS, A as AVISO_URGENTE } from './categorias-BK8Z_nGh.js';

//#region src/lib/components/SelectorCategorias.svelte
function SelectorCategorias($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** ids seleccionados (bindable) */
		let { seleccionadas = [], name = "categoria" } = $$props;
		let urgentes = derived(() => seleccionadas.filter((id) => CATEGORIA_POR_ID.get(id)?.urgente));
		const cuantasEn = (ids) => ids.filter((c) => seleccionadas.includes(c.id)).length;
		$$renderer.push(`<div class="space-y-2"><!--[-->`);
		const each_array = ensure_array_like(seleccionadas);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let id = each_array[$$index];
			$$renderer.push(`<input type="hidden"${attr("name", name)}${attr("value", id)}/>`);
		}
		$$renderer.push(`<!--]--> `);
		if (seleccionadas.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="flex flex-wrap gap-1.5"><!--[-->`);
			const each_array_1 = ensure_array_like(seleccionadas);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let id = each_array_1[$$index_1];
				const c = CATEGORIA_POR_ID.get(id);
				if (c) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button type="button" class="text-xs px-2 py-1 rounded-full text-white"${attr_style(`background:${stringify(c.color)}`)}>${escape_html(c.urgente ? "⚠️ " : "")}${escape_html(c.nombre)} ✕</button>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="border border-gray-200 rounded-lg divide-y divide-gray-100"><!--[-->`);
		const each_array_2 = ensure_array_like(CATEGORIAS);
		for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
			let g = each_array_2[$$index_3];
			$$renderer.push(`<details${attr("open", cuantasEn(g.items) > 0, true)}><summary class="px-3 py-2 text-sm text-gray-800 cursor-pointer flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full inline-block"${attr_style(`background:${stringify(g.color)}`)}></span> ${escape_html(g.grupo)} `);
			if (cuantasEn(g.items)) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="text-xs text-gray-500">(${escape_html(cuantasEn(g.items))})</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></summary> <div class="px-3 pb-2 grid sm:grid-cols-2 gap-1"><!--[-->`);
			const each_array_3 = ensure_array_like(g.items);
			for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
				let c = each_array_3[$$index_2];
				$$renderer.push(`<label class="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox"${attr("checked", seleccionadas.includes(c.id), true)}/> ${escape_html(c.nombre)}`);
				if (c.urgente) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="text-[10px] px-1.5 rounded bg-red-100 text-red-700">urgente</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></label>`);
			}
			$$renderer.push(`<!--]--></div></details>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (urgentes().length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-300 text-red-800 text-xs rounded-lg px-3 py-2">⚠️ <strong>${escape_html(urgentes().map((id) => CATEGORIA_POR_ID.get(id)?.nombre).join(", "))}:</strong> ${escape_html(AVISO_URGENTE)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
		bind_props($$props, { seleccionadas });
	});
}

export { SelectorCategorias as S };
//# sourceMappingURL=SelectorCategorias-BLURhBvd.js.map
