import { h as head, b as attr, a as ensure_array_like, c as attr_class, e as escape_html, s as stringify } from './dev-BsmPEhme.js';

//#region src/routes/institucional/efemerides/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const ESTADO_COLOR = {
			planificado: "bg-blue-100 text-blue-700",
			realizado: "bg-green-100 text-green-700",
			cancelado: "bg-gray-100 text-gray-500"
		};
		let busqueda = "";
		let filtroEstado = data.estado ?? "";
		let listaFiltrada = data.lista;
		function parseCursos(json) {
			if (!json) return "";
			try {
				const arr = JSON.parse(json);
				if (Array.isArray(arr)) return arr.map((c) => c.cursoNombre ?? c).join(", ");
			} catch {}
			return json;
		}
		head("1y2ruqz", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Efemérides — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center justify-between"><h2 class="text-lg font-bold text-gray-900">Efemérides y Actos</h2> <a href="/institucional/efemerides/nueva" class="btn-primary text-sm">+ Nueva</a></div> <div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span> <input type="text"${attr("value", busqueda)} placeholder="Buscar por título o docente..." class="form-input pl-9 w-full text-sm"/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="flex gap-2 overflow-x-auto pb-1"><!--[-->`);
		const each_array = ensure_array_like([
			["", "Todos"],
			["planificado", "Planificado"],
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
			$$renderer.push(`<div class="card text-center py-10"><p class="text-3xl mb-2">📅</p> <p class="text-gray-500 text-sm">No hay efemérides registradas.</p> <a href="/institucional/efemerides/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Crear la primera</a></div>`);
		} else if (listaFiltrada.length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="card text-center py-8"><p class="text-2xl mb-2">🔍</p> <p class="text-gray-500 text-sm">No hay efemérides que coincidan.</p> <button class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-2"><!--[-->`);
			const each_array_1 = ensure_array_like(listaFiltrada);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let ev = each_array_1[$$index_1];
				$$renderer.push(`<a${attr("href", `/institucional/efemerides/${stringify(ev.id)}`)} class="card block hover:border-indigo-300 transition-colors space-y-1"><div class="flex items-start justify-between gap-2"><p class="text-sm font-semibold text-gray-800 flex-1">${escape_html(ev.titulo)}</p> <span${attr_class(`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${stringify(ESTADO_COLOR[ev.estado] ?? "bg-gray-100 text-gray-600")}`)}>${escape_html(ev.estado)}</span></div> <p class="text-xs text-gray-500">📅 ${escape_html(ev.fecha)}</p> `);
				if (ev.docenteResponsable) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-gray-600">👤 ${escape_html(ev.docenteResponsable)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (ev.cursosResponsables) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-indigo-600">📚 ${escape_html(parseCursos(ev.cursosResponsables))}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (ev.descripcion) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-gray-500 line-clamp-2">${escape_html(ev.descripcion)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></a>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DBf0JKdv.js.map
