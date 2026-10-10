import { a as ensure_array_like, b as attr, c as attr_class, s as stringify, e as escape_html } from './dev-BsmPEhme.js';
import { p as page } from './state-GAOmzglP.js';
import './client2-Ds2pOMTK.js';
import './internal-Bh7K86Ic.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/gabinete/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const tabs = [
			{
				href: "/gabinete",
				label: "Tablero",
				icon: "🧭",
				exact: true
			},
			{
				href: "/gabinete/casos",
				label: "Casos",
				icon: "📂"
			},
			{
				href: "/gabinete/guia",
				label: "Guía de apoyos",
				icon: "📚"
			}
		];
		function activo(t) {
			return t.exact ? page.url.pathname === t.href : page.url.pathname.startsWith(t.href);
		}
		$$renderer.push(`<div class="space-y-4"><div><h1 class="text-xl font-bold text-gray-900">🧠 Gabinete psicopedagógico</h1> <p class="text-xs text-gray-400">Información reservada — solo gabinete y administración</p></div> <div class="bg-white border border-gray-200 rounded-xl overflow-x-auto print:hidden"><nav class="flex min-w-max"><!--[-->`);
		const each_array = ensure_array_like(tabs);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let t = each_array[$$index];
			$$renderer.push(`<a${attr("href", t.href)}${attr_class(`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${stringify(activo(t) ? "border-indigo-600 text-indigo-700 bg-indigo-50" : "border-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-50")}`)}><span>${escape_html(t.icon)}</span>${escape_html(t.label)}</a>`);
		}
		$$renderer.push(`<!--]--></nav></div> `);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-BngIPsuc.js.map
