import { R as head, S as escape_html, T as ensure_array_like, V as attr_class, a7 as clsx$1 } from './dev-BsNQnjV4.js';

//#region src/routes/admin/status/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		head("2ibybj", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Estado Moodle — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><h1 class="text-xl font-bold text-gray-900">Estado de Moodle</h1> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="card text-center py-10"><p class="text-gray-500 animate-pulse">Verificando conexión...</p></div>`);
		$$renderer.push(`<!--]--> `);
		if (data.logs && data.logs.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card"><h2 class="font-semibold text-gray-800 mb-3">Log de actividad <span class="text-sm font-normal text-gray-400">(${escape_html(data.logs.length)} registros)</span></h2> <div class="space-y-1.5 max-h-80 overflow-y-auto"><!--[-->`);
			const each_array_2 = ensure_array_like(data.logs);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let log = each_array_2[$$index_2];
				$$renderer.push(`<div class="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2"><span${attr_class(clsx$1(log.status === "ok" ? "text-green-500 flex-shrink-0" : "text-red-500 flex-shrink-0"))}>●</span> <div class="flex-1 min-w-0"><span class="font-medium text-gray-700">${escape_html(log.tipo)}</span> <span class="mx-1">—</span> <span class="break-all">${escape_html(log.mensaje)}</span></div> <span class="text-gray-300 whitespace-nowrap flex-shrink-0">${escape_html(new Date(log.createdAt).toLocaleString("es-AR", {
					day: "2-digit",
					month: "2-digit",
					hour: "2-digit",
					minute: "2-digit"
				}))}</span></div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DuVdpU8B.js.map
