import { R as head, U as attr, S as escape_html, T as ensure_array_like, V as attr_class, W as stringify } from './dev-BjcCn9Qu.js';

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
		function buildPageUrl(page) {
			const p = new URLSearchParams();
			if (data.alumnoQ) p.set("alumno", data.alumnoQ);
			if (data.cursoQ) p.set("curso", data.cursoQ);
			if (page > 1) p.set("page", String(page));
			return `?${p.toString()}`;
		}
		const hayFiltros = data.alumnoQ || data.cursoQ;
		head("4ecer9", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Faltas — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center justify-between"><h2 class="text-lg font-bold text-gray-900">Faltas</h2> <a href="/preceptor/faltas/nueva" class="btn-primary text-sm">+ Nueva falta</a></div> <form method="GET" action="/preceptor/faltas" class="bg-white rounded-xl border border-gray-200 p-3 space-y-2"><div class="flex gap-2"><input type="search" name="alumno"${attr("value", data.alumnoQ)} placeholder="🔍 Buscar alumno..." class="form-input flex-1 text-sm"/> <input type="search" name="curso"${attr("value", data.cursoQ)} placeholder="📚 Curso..." class="form-input w-28 text-sm"/></div> <div class="flex gap-2"><button type="submit" class="flex-1 bg-indigo-600 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">Buscar</button> `);
		if (hayFiltros) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<a href="/preceptor/faltas" class="text-xs text-gray-400 hover:text-gray-700 px-2 flex items-center">Limpiar</a>`);
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
			$$renderer.push(`<!--]--></p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></form> `);
		if (data.lista.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-3xl mb-2">📅</p> `);
			if (hayFiltros) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-gray-500 text-sm">No hay faltas que coincidan con los filtros.</p> <button class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<p class="text-gray-500 text-sm">No hay faltas registradas.</p> <a href="/preceptor/faltas/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Registrar la primera</a>`);
			}
			$$renderer.push(`<!--]--></div>`);
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
//# sourceMappingURL=_page.svelte-DoYpfqqL.js.map
