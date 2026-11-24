import { a as ensure_array_like, b as attr, c as attr_class, e as escape_html } from './index.js-D6_LEqEo.js';
import { p as page } from './state-BtAJWp-X.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit';
import '@sveltejs/kit/internal/server';
import './client2-D0o9x_5T.js';

// src/routes/institucional/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const tabs = [{
			href: "/institucional/efemerides",
			label: "Efemérides",
			icon: "📅"
		}, {
			href: "/institucional/salidas",
			label: "Salidas",
			icon: "🚌"
		}];
		function isActive(href) {
			return page.url.pathname.startsWith(href);
		}
		$$renderer.push(`<div class="space-y-4"><div class="bg-white border border-gray-200 rounded-xl overflow-x-auto"><nav class="flex min-w-max"><!--[-->`);
		const each_array = ensure_array_like(tabs);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let tab = each_array[$$index];
			$$renderer.push(`<a${attr("href", tab.href)}${attr_class(`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${isActive(tab.href) ? "border-indigo-600 text-indigo-700 bg-indigo-50" : "border-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-50"}`)}><span>${escape_html(tab.icon)}</span> ${escape_html(tab.label)}</a>`);
		}
		$$renderer.push(`<!--]--></nav></div> `);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-Cc_Fkm98.js.map
