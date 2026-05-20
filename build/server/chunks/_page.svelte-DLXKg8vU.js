import { R as head, U as attr, S as escape_html, T as ensure_array_like, V as attr_class, W as stringify } from './dev-BsNQnjV4.js';

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
		let busqueda = "";
		let listaFiltrada = data.lista;
		function buildPageUrl(p) {
			const params = new URLSearchParams();
			if (p > 1) params.set("page", String(p));
			return `?${params.toString()}`;
		}
		head("4ecer9", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Faltas — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center justify-between"><h2 class="text-lg font-bold text-gray-900">Faltas</h2> <a href="/preceptor/faltas/nueva" class="btn-primary text-sm">+ Nueva falta</a></div> <div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span> <input type="text"${attr("value", busqueda)} placeholder="Buscar por alumno o curso..." class="form-input pl-9 w-full text-sm"/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (data.lista.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-3xl mb-2">📅</p> <p class="text-gray-500 text-sm">No hay faltas registradas.</p> <a href="/preceptor/faltas/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Registrar la primera</a></div>`);
		} else if (listaFiltrada.length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="card text-center py-8"><p class="text-2xl mb-2">🔍</p> <p class="text-gray-500 text-sm">No hay faltas que coincidan con "<strong>${escape_html(busqueda)}</strong>".</p> <button class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-2"><!--[-->`);
			const each_array = ensure_array_like(listaFiltrada);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let falta = each_array[$$index];
				$$renderer.push(`<div class="card space-y-1"><div class="flex items-center justify-between gap-2"><span class="text-sm font-semibold text-gray-800">${escape_html(falta.cursoNombre)}</span> <span${attr_class(`text-xs px-2 py-0.5 rounded-full ${stringify(TIPO_COLOR[falta.tipo] ?? "bg-gray-100 text-gray-700")}`)}>${escape_html(TIPO_LABEL[falta.tipo] ?? falta.tipo)}</span></div> `);
				if (falta.alumnos && falta.alumnos.length > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-gray-600">👤 ${escape_html(falta.alumnos.map((a) => a.alumnoNombre).join(", "))}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <p class="text-xs text-gray-500">📅 ${escape_html(falta.fecha)} · ${escape_html(falta.visibilidad === "interna" ? "🔒 Interna" : "🌐 Pública")}</p> `);
				if (falta.descripcion) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-gray-600 truncate">${escape_html(falta.descripcion)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <span class="text-xs text-gray-400">Estado: ${escape_html(falta.estado)}</span></div>`);
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
//# sourceMappingURL=_page.svelte-DLXKg8vU.js.map
