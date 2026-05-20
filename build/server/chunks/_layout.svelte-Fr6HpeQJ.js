import { T as ensure_array_like, U as attr, V as attr_class, W as stringify, S as escape_html } from './dev-BsNQnjV4.js';
import { p as page } from './state-GzosuFax.js';
import './client2-BCRM2Xnk.js';
import './internal-BAmKnqFi.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/preceptor/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const tabs = [
			{
				href: "/preceptor",
				label: "Inicio",
				icon: "🏠",
				exact: true
			},
			{
				href: "/preceptor/faltas",
				label: "Faltas",
				icon: "📅"
			},
			{
				href: "/preceptor/amonestaciones",
				label: "Amonestaciones",
				icon: "⚠️"
			},
			{
				href: "/preceptor/reincorporaciones",
				label: "Reincorporaciones",
				icon: "✅"
			},
			{
				href: "/preceptor/actas",
				label: "Actas",
				icon: "📄"
			}
		];
		function isActive(href, exact = false) {
			if (exact) return page.url.pathname === href;
			return page.url.pathname.startsWith(href);
		}
		$$renderer.push(`<div class="space-y-4"><div class="bg-white border border-gray-200 rounded-xl overflow-x-auto"><nav class="flex min-w-max"><!--[-->`);
		const each_array = ensure_array_like(tabs);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let tab = each_array[$$index];
			$$renderer.push(`<a${attr("href", tab.href)}${attr_class(`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${stringify(isActive(tab.href, tab.exact) ? "border-indigo-600 text-indigo-700 bg-indigo-50" : "border-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-50")}`)}><span>${escape_html(tab.icon)}</span> ${escape_html(tab.label)}</a>`);
		}
		$$renderer.push(`<!--]--></nav></div> `);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-Fr6HpeQJ.js.map
