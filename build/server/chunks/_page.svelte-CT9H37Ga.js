import { R as head, T as ensure_array_like, S as escape_html, V as attr_class, W as stringify, U as attr } from './dev-BjcCn9Qu.js';

//#region src/routes/preceptor/faltas/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const TIPO_LABEL = {
			ausente: "Ausente",
			retraso: "Retraso",
			salida_anticipada: "Salida anticipada",
			otra: "Otra"
		};
		const TIPO_COLOR = {
			ausente: "bg-red-100 text-red-700",
			retraso: "bg-yellow-100 text-yellow-700",
			salida_anticipada: "bg-orange-100 text-orange-700",
			otra: "bg-gray-100 text-gray-700"
		};
		head("4ecer9", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Faltas — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center justify-between"><h2 class="text-lg font-bold text-gray-900">Faltas</h2> <a href="/preceptor/faltas/nueva" class="btn-primary text-sm">+ Nueva falta</a></div> `);
		if (data.lista.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-3xl mb-2">📅</p> <p class="text-gray-500 text-sm">No hay faltas registradas.</p> <a href="/preceptor/faltas/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Registrar la primera</a></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-2"><!--[-->`);
			const each_array = ensure_array_like(data.lista);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let falta = each_array[$$index];
				$$renderer.push(`<div class="card space-y-1"><div class="flex items-center justify-between gap-2"><span class="text-sm font-semibold text-gray-800">${escape_html(falta.cursoNombre)}</span> <span${attr_class(`text-xs px-2 py-0.5 rounded-full ${stringify(TIPO_COLOR[falta.tipo] ?? "bg-gray-100 text-gray-700")}`)}>${escape_html(TIPO_LABEL[falta.tipo] ?? falta.tipo)}</span></div> <p class="text-xs text-gray-500">📅 ${escape_html(falta.fecha)} · ${escape_html(falta.visibilidad === "interna" ? "🔒 Interna" : "🌐 Pública")}</p> `);
				if (falta.descripcion) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-gray-600 truncate">${escape_html(falta.descripcion)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <div class="flex items-center justify-between pt-1"><span class="text-xs text-gray-400">Estado: ${escape_html(falta.estado)}</span></div></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="flex gap-2 justify-center pt-2">`);
			if (data.page > 1) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<a${attr("href", `?page=${stringify(data.page - 1)}`)} class="text-sm text-indigo-600 hover:underline">← Anterior</a>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <span class="text-sm text-gray-500">Página ${escape_html(data.page)}</span> `);
			if (data.lista.length === 20) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<a${attr("href", `?page=${stringify(data.page + 1)}`)} class="text-sm text-indigo-600 hover:underline">Siguiente →</a>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CT9H37Ga.js.map
