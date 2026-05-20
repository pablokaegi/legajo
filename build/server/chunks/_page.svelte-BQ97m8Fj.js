import { h as head, b as attr, a as ensure_array_like, c as attr_class, e as escape_html, s as stringify } from './dev-BsmPEhme.js';

//#region src/routes/institucional/salidas/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const ESTADO_COLOR = {
			borrador: "bg-gray-100 text-gray-600",
			aprobado: "bg-blue-100 text-blue-700",
			realizado: "bg-green-100 text-green-700",
			cancelado: "bg-red-100 text-red-600"
		};
		let busqueda = "";
		let filtroEstado = data.estado ?? "";
		let listaFiltrada = data.lista;
		head("h0mxl1", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Salidas Didácticas — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center justify-between"><h2 class="text-lg font-bold text-gray-900">Salidas Didácticas</h2> <a href="/institucional/salidas/nueva" class="btn-primary text-sm">+ Nueva</a></div> <div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span> <input type="text"${attr("value", busqueda)} placeholder="Buscar por destino, curso o docente..." class="form-input pl-9 w-full text-sm"/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="flex gap-2 overflow-x-auto pb-1"><!--[-->`);
		const each_array = ensure_array_like([
			["", "Todas"],
			["borrador", "Borrador"],
			["aprobado", "Aprobado"],
			["realizado", "Realizado"],
			["cancelado", "Cancelado"]
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [val, lbl] = each_array[$$index];
			$$renderer.push(`<button${attr_class(`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${stringify(filtroEstado === val ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 text-gray-600 hover:border-indigo-300")}`)}>${escape_html(lbl)}</button>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (data.lista.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-3xl mb-2">🚌</p> <p class="text-gray-500 text-sm">No hay salidas didácticas registradas.</p> <a href="/institucional/salidas/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Crear la primera</a></div>`);
		} else if (listaFiltrada.length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="card text-center py-8"><p class="text-2xl mb-2">🔍</p> <p class="text-gray-500 text-sm">No hay salidas que coincidan.</p> <button class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-2"><!--[-->`);
			const each_array_1 = ensure_array_like(listaFiltrada);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let s = each_array_1[$$index_1];
				$$renderer.push(`<a${attr("href", `/institucional/salidas/${stringify(s.id)}`)} class="card block hover:border-indigo-300 transition-colors space-y-1"><div class="flex items-start justify-between gap-2"><div class="flex-1 min-w-0"><p class="text-sm font-semibold text-gray-800">${escape_html(s.titulo)}</p> <p class="text-xs text-gray-500">📍 ${escape_html(s.destino)}</p></div> <div class="flex flex-col items-end gap-1 flex-shrink-0"><span${attr_class(`text-xs px-2 py-0.5 rounded-full ${stringify(ESTADO_COLOR[s.estado] ?? "bg-gray-100 text-gray-600")}`)}>${escape_html(s.estado)}</span> `);
				if (s.documentoPath) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="text-xs text-green-600">📎 Doc. subido</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></div> <p class="text-xs text-gray-500">📅 ${escape_html(s.fecha)} · ${escape_html(s.cursoNombre)}</p> <p class="text-xs text-gray-600">👤 ${escape_html(s.responsableNombre)}</p></a>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BQ97m8Fj.js.map
