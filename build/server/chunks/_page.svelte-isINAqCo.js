import { h as head, b as attr, a as ensure_array_like, c as attr_class, e as escape_html, s as stringify } from './dev-BsmPEhme.js';

//#region src/routes/preceptor/actas/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let busqueda = "";
		let filtroEstado = data.estado ?? "";
		let listaFiltrada = data.lista;
		function buildPageUrl(p) {
			const params = new URLSearchParams();
			if (filtroEstado) params.set("estado", filtroEstado);
			if (p > 1) params.set("page", String(p));
			return `?${params.toString()}`;
		}
		head("kca9q4", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Actas — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center justify-between"><h2 class="text-lg font-bold text-gray-900">Actas de seguimiento</h2> <a href="/preceptor/actas/nueva" class="btn-primary text-sm">+ Nueva acta</a></div> <div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span> <input type="text"${attr("value", busqueda)} placeholder="Buscar por alumno, título o resumen..." class="form-input pl-9 w-full text-sm"/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="flex gap-2 overflow-x-auto pb-1"><!--[-->`);
		const each_array = ensure_array_like([
			["", "Todas"],
			["abierta", "Abiertas"],
			["cerrada", "Cerradas"]
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [val, lbl] = each_array[$$index];
			$$renderer.push(`<button${attr_class(`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${stringify(filtroEstado === val ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 text-gray-600 hover:border-indigo-300")}`)}>${escape_html(lbl)}</button>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (filtroEstado) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-xs text-indigo-600">${escape_html(listaFiltrada.length)} de ${escape_html(data.lista.length)} actas</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (data.lista.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-3xl mb-2">📄</p> <p class="text-gray-500 text-sm">No hay actas registradas.</p> <a href="/preceptor/actas/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Crear la primera</a></div>`);
		} else if (listaFiltrada.length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="card text-center py-8"><p class="text-2xl mb-2">🔍</p> <p class="text-gray-500 text-sm">No hay actas que coincidan.</p> <button class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-2"><!--[-->`);
			const each_array_1 = ensure_array_like(listaFiltrada);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let acta = each_array_1[$$index_1];
				$$renderer.push(`<a${attr("href", `/preceptor/actas/${stringify(acta.id)}`)} class="card block hover:border-indigo-300 transition-colors space-y-1"><div class="flex items-start justify-between gap-2"><p class="text-sm font-semibold text-gray-800 flex-1">${escape_html(acta.titulo)}</p> <span${attr_class(`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${stringify(acta.estado === "abierta" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}`)}>${escape_html(acta.estado)}</span></div> `);
				if (acta.alumnos && acta.alumnos.length > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-indigo-600">👤 ${escape_html(acta.alumnos.map((a) => a.alumnoNombre).join(", "))}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <p class="text-xs text-gray-500">📅 ${escape_html(acta.fecha)}</p> <p class="text-xs text-gray-600 line-clamp-2">${escape_html(acta.resumen)}</p></a>`);
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
//# sourceMappingURL=_page.svelte-isINAqCo.js.map
