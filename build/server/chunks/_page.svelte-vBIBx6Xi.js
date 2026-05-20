import { R as head, U as attr, T as ensure_array_like, V as attr_class, S as escape_html, W as stringify } from './dev-BsNQnjV4.js';

//#region src/routes/preceptor/amonestaciones/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const GRAVEDAD_COLOR = {
			leve: "bg-yellow-100 text-yellow-700",
			mediana: "bg-orange-100 text-orange-700",
			grave: "bg-red-100 text-red-700"
		};
		let busqueda = "";
		let filtroGravedad = "";
		let listaFiltrada = data.lista;
		function buildPageUrl(p) {
			const params = new URLSearchParams();
			if (p > 1) params.set("page", String(p));
			return `?${params.toString()}`;
		}
		head("16rq3g1", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Amonestaciones — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center justify-between"><h2 class="text-lg font-bold text-gray-900">Amonestaciones</h2> <a href="/preceptor/amonestaciones/nueva" class="btn-primary text-sm">+ Nueva</a></div> <div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span> <input type="text"${attr("value", busqueda)} placeholder="Buscar por alumno o curso..." class="form-input pl-9 w-full text-sm"/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="flex gap-2 overflow-x-auto pb-1"><!--[-->`);
		const each_array = ensure_array_like([
			["", "Todas"],
			["leve", "Leve"],
			["mediana", "Mediana"],
			["grave", "Grave"]
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [val, lbl] = each_array[$$index];
			$$renderer.push(`<button${attr_class(`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${stringify(filtroGravedad === val ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 text-gray-600 hover:border-indigo-300")}`)}>${escape_html(lbl)}</button>`);
		}
		$$renderer.push(`<!--]--></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (data.lista.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-3xl mb-2">⚠️</p> <p class="text-gray-500 text-sm">No hay amonestaciones registradas.</p> <a href="/preceptor/amonestaciones/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Registrar la primera</a></div>`);
		} else if (listaFiltrada.length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="card text-center py-8"><p class="text-2xl mb-2">🔍</p> <p class="text-gray-500 text-sm">No hay amonestaciones que coincidan.</p> <button class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-2"><!--[-->`);
			const each_array_1 = ensure_array_like(listaFiltrada);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let amon = each_array_1[$$index_1];
				$$renderer.push(`<div class="card space-y-1"><div class="flex items-center justify-between gap-2"><span class="text-sm font-semibold text-gray-800">${escape_html(amon.alumnoNombre)}</span> <span${attr_class(`text-xs px-2 py-0.5 rounded-full ${stringify(GRAVEDAD_COLOR[amon.gravedad] ?? "bg-gray-100 text-gray-600")}`)}>${escape_html(amon.gravedad)}</span></div> `);
				if (amon.cursoNombre) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-gray-500">${escape_html(amon.cursoNombre)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <p class="text-xs text-gray-600 line-clamp-2">${escape_html(amon.motivo)}</p> <p class="text-xs text-gray-400">📅 ${escape_html(amon.fecha)}</p></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="flex gap-2 justify-center pt-2">`);
			if (data.page > 1) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<a${attr("href", buildPageUrl(data.page - 1))} class="text-sm text-indigo-600 hover:underline">← Anterior</a>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <span class="text-sm text-gray-500">Página ${escape_html(data.page)}</span> `);
			if (data.lista.length === 20) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<a${attr("href", buildPageUrl(data.page + 1))} class="text-sm text-indigo-600 hover:underline">Siguiente →</a>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-vBIBx6Xi.js.map
