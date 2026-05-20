import { R as head, S as escape_html, T as ensure_array_like, U as attr, V as attr_class, W as stringify, K as derived } from './dev-BsNQnjV4.js';
import { p as page } from './state-gexQLK7l.js';
import './client2-BhQlrij_.js';
import './internal-CON1I-7W.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;
		const ROL_PRECEPTOR = ["preceptor", "directivo"];
		const navItems = derived(() => [
			{
				href: "/",
				label: "Inicio",
				icon: "🏠"
			},
			{
				href: "/cursos",
				label: "Cursos",
				icon: "📚"
			},
			{
				href: "/observaciones/nueva",
				label: "Nueva",
				icon: "✏️"
			},
			{
				href: "/observaciones/historial",
				label: "Historial",
				icon: "📋"
			},
			...data.usuario?.roles?.some((r) => ROL_PRECEPTOR.includes(r)) ? [{
				href: "/preceptor",
				label: "Preceptor",
				icon: "📌"
			}] : []
		]);
		function isActive(href) {
			if (href === "/") return page.url.pathname === "/";
			return page.url.pathname.startsWith(href);
		}
		head("12qhfyh", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Legajo</title>`);
			});
		});
		if (data.usuario) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="min-h-screen bg-gray-50 flex flex-col"><header class="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-md"><a href="/" class="flex items-center gap-2"><img src="/logo-pds.png" alt="PDS" class="h-8 w-auto" onerror="this.__e=event"/> <span class="font-bold text-lg tracking-tight hidden sm:inline">Legajo</span></a> <div class="flex items-center gap-3"><span class="text-sm opacity-90 hidden sm:block">${escape_html(data.usuario.nombre)}</span> <form method="POST" action="/auth?/logout"><button type="submit" class="text-sm bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded-lg transition-colors">Salir</button></form></div></header> <main class="flex-1 pb-20 sm:pb-6 max-w-2xl w-full mx-auto px-4 py-5">`);
			children($$renderer);
			$$renderer.push(`<!----></main> <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex sm:hidden z-10"><!--[-->`);
			const each_array = ensure_array_like(navItems());
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				$$renderer.push(`<a${attr("href", item.href)}${attr_class(`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${stringify(isActive(item.href) ? "text-indigo-600 font-semibold" : "text-gray-500 hover:text-indigo-500")}`)}><span class="text-xl leading-none mb-0.5">${escape_html(item.icon)}</span> ${escape_html(item.label)}</a>`);
			}
			$$renderer.push(`<!--]--></nav> <nav class="hidden sm:flex fixed left-0 top-14 bottom-0 w-48 bg-white border-r border-gray-200 flex-col pt-4 px-2 gap-1"><!--[-->`);
			const each_array_1 = ensure_array_like(navItems());
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let item = each_array_1[$$index_1];
				$$renderer.push(`<a${attr("href", item.href)}${attr_class(`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${stringify(isActive(item.href) ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50")}`)}><span>${escape_html(item.icon)}</span> ${escape_html(item.label)}</a>`);
			}
			$$renderer.push(`<!--]--></nav></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="min-h-screen bg-gray-50">`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-Exz7l35Q.js.map
