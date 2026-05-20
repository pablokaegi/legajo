import { R as head, U as attr, S as escape_html, T as ensure_array_like, V as attr_class, W as stringify } from './dev-BjcCn9Qu.js';

//#region src/routes/preceptor/amonestaciones/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const GRAVEDAD_COLOR = {
			leve: "bg-yellow-100 text-yellow-700",
			mediana: "bg-orange-100 text-orange-700",
			grave: "bg-red-100 text-red-700"
		};
		function buildPageUrl(page) {
			const p = new URLSearchParams();
			if (data.alumnoQ) p.set("alumno", data.alumnoQ);
			if (data.cursoQ) p.set("curso", data.cursoQ);
			if (data.gravedad) p.set("gravedad", data.gravedad);
			if (page > 1) p.set("page", String(page));
			return `?${p.toString()}`;
		}
		function gravedadUrl(val) {
			const p = new URLSearchParams();
			if (data.alumnoQ) p.set("alumno", data.alumnoQ);
			if (data.cursoQ) p.set("curso", data.cursoQ);
			if (val) p.set("gravedad", val);
			return `?${p.toString()}`;
		}
		const hayFiltros = data.alumnoQ || data.cursoQ || data.gravedad;
		head("16rq3g1", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Amonestaciones — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center justify-between"><h2 class="text-lg font-bold text-gray-900">Amonestaciones</h2> <a href="/preceptor/amonestaciones/nueva" class="btn-primary text-sm">+ Nueva</a></div> <form method="GET" action="/preceptor/amonestaciones" class="bg-white rounded-xl border border-gray-200 p-3 space-y-2">`);
		if (data.gravedad) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<input type="hidden" name="gravedad"${attr("value", data.gravedad)}/>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="flex gap-2"><input type="search" name="alumno"${attr("value", data.alumnoQ)} placeholder="🔍 Buscar alumno..." class="form-input flex-1 text-sm"/> <input type="search" name="curso"${attr("value", data.cursoQ)} placeholder="📚 Curso..." class="form-input w-28 text-sm"/></div> <div class="flex gap-2"><button type="submit" class="flex-1 bg-indigo-600 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">Buscar</button> `);
		if (hayFiltros) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<a href="/preceptor/amonestaciones" class="text-xs text-gray-400 hover:text-gray-700 px-2 flex items-center">Limpiar</a>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (hayFiltros) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-xs text-indigo-600">`);
			if (data.alumnoQ) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`Alumno: <strong>${escape_html(data.alumnoQ)}</strong>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (data.alumnoQ && data.cursoQ) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`·`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (data.cursoQ) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`Curso: <strong>${escape_html(data.cursoQ)}</strong>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if ((data.alumnoQ || data.cursoQ) && data.gravedad) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`·`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (data.gravedad) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`Gravedad: <strong>${escape_html(data.gravedad)}</strong>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></form> <div class="flex gap-2 overflow-x-auto pb-1"><!--[-->`);
		const each_array = ensure_array_like([
			["", "Todas"],
			["leve", "Leve"],
			["mediana", "Mediana"],
			["grave", "Grave"]
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [val, lbl] = each_array[$$index];
			$$renderer.push(`<a${attr("href", gravedadUrl(val))}${attr_class(`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${stringify(data.gravedad === (val || null) ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 text-gray-600 hover:border-indigo-300")}`)}>${escape_html(lbl)}</a>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (data.lista.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-3xl mb-2">⚠️</p> `);
			if (hayFiltros) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-gray-500 text-sm">No hay amonestaciones que coincidan.</p> <button class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<p class="text-gray-500 text-sm">No hay amonestaciones registradas.</p> <a href="/preceptor/amonestaciones/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Registrar la primera</a>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-2"><!--[-->`);
			const each_array_1 = ensure_array_like(data.lista);
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
//# sourceMappingURL=_page.svelte-CMfUc5yF.js.map
