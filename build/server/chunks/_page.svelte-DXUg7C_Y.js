import { h as head, a as ensure_array_like, c as attr_class, e as escape_html, s as stringify } from './dev-BsmPEhme.js';

//#region src/routes/admin/logs/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let seccion = "acciones";
		function fechaHora(d) {
			return new Date(d).toLocaleString("es-AR", {
				day: "2-digit",
				month: "2-digit",
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		head("1w6l7vk", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Logs — Configuración</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="bg-white border border-gray-200 rounded-xl overflow-x-auto"><nav class="flex min-w-max"><!--[-->`);
		const each_array = ensure_array_like([["acciones", "🧾 Auditoría de acciones"], ["sync", "🔄 Sincronización Moodle"]]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [val, lbl] = each_array[$$index];
			$$renderer.push(`<button${attr_class(`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${stringify(seccion === val ? "border-indigo-600 text-indigo-700 bg-indigo-50" : "border-transparent text-gray-600 hover:bg-gray-50")}`)}>${escape_html(lbl)}</button>`);
		}
		$$renderer.push(`<!--]--></nav></div> `);
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">Auditoría de acciones (${escape_html(data.acciones.length)})</p> `);
			if (data.acciones.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-sm text-gray-500">Sin acciones registradas.</p>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="space-y-1.5 max-h-[70vh] overflow-y-auto"><!--[-->`);
				const each_array_1 = ensure_array_like(data.acciones);
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let a = each_array_1[$$index_1];
					$$renderer.push(`<div class="flex items-start gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2"><div class="flex-1 min-w-0"><span class="font-medium text-gray-800">${escape_html(a.accion)}</span> `);
					if (a.tablaDestino) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="text-gray-400">· ${escape_html(a.tablaDestino)}${escape_html(a.idDestino ? ` #${a.idDestino}` : "")}</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> <p class="text-gray-500">${escape_html(a.usuarioNombre ?? "Sistema")}${escape_html(a.ip ? ` · ${a.ip}` : "")}</p></div> <span class="text-gray-400 whitespace-nowrap flex-shrink-0">${escape_html(fechaHora(a.createdAt))}</span></div>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DXUg7C_Y.js.map
