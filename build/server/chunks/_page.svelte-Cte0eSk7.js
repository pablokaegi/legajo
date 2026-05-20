import { R as head, T as ensure_array_like, S as escape_html, U as attr, W as stringify } from './dev-BsNQnjV4.js';

//#region src/routes/preceptor/reincorporaciones/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		head("1173uj7", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Reincorporaciones — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center justify-between"><h2 class="text-lg font-bold text-gray-900">Reincorporaciones</h2> <a href="/preceptor/reincorporaciones/nueva" class="btn-primary text-sm">+ Nueva</a></div> `);
		if (data.lista.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-3xl mb-2">✅</p> <p class="text-gray-500 text-sm">No hay reincorporaciones registradas.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-2"><!--[-->`);
			const each_array = ensure_array_like(data.lista);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let r = each_array[$$index];
				$$renderer.push(`<div class="card space-y-1"><p class="text-sm font-semibold text-gray-800">${escape_html(r.alumnoNombre)}</p> <p class="text-xs text-gray-500">📅 Fecha de reincorporación: <strong>${escape_html(r.fechaReincorporacion)}</strong></p> `);
				if (r.observaciones) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-gray-600 line-clamp-2">${escape_html(r.observaciones)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (r.documentoUrl) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<a${attr("href", r.documentoUrl)} target="_blank" rel="noopener" class="text-xs text-indigo-600 hover:underline">📎 Ver documento</a>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
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
//# sourceMappingURL=_page.svelte-Cte0eSk7.js.map
