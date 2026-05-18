import { g as getContext, h as head, e as escape_html, a as ensure_array_like, b as attr, c as attr_class, s as stringify, d as store_get, f as unsubscribe_stores } from './dev-B1vF67ZX.js';
import './client2-DCr7IOME.js';
import './internal-BZC4M7Id.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region node_modules/@sveltejs/kit/src/runtime/app/stores.js
/**
* A function that returns all of the contextual stores. On the server, this must be called during component initialization.
* Only use this if you need to defer store subscription until after the component has mounted, for some reason.
*
* @deprecated Use `$app/state` instead (requires Svelte 5, [see docs for more info](https://svelte.dev/docs/kit/migrating-to-sveltekit-2#SvelteKit-2.12:-$app-stores-deprecated))
*/
var getStores = () => {
	const stores$1 = getContext("__svelte__");
	return {
		/** @type {typeof page} */
		page: { subscribe: stores$1.page.subscribe },
		/** @type {typeof navigating} */
		navigating: { subscribe: stores$1.navigating.subscribe },
		/** @type {typeof updated} */
		updated: stores$1.updated
	};
};
/**
* A readable store whose value contains page data.
*
* On the server, this store can only be subscribed to during component initialization. In the browser, it can be subscribed to at any time.
*
* @deprecated Use `page` from `$app/state` instead (requires Svelte 5, [see docs for more info](https://svelte.dev/docs/kit/migrating-to-sveltekit-2#SvelteKit-2.12:-$app-stores-deprecated))
* @type {import('svelte/store').Readable<import('@sveltejs/kit').Page>}
*/
var page = { subscribe(fn) {
	return getStores().page.subscribe(fn);
} };

//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data, children } = $$props;
		const navItems = [
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
			}
		];
		function isActive(href) {
			if (href === "/") return store_get($$store_subs ??= {}, "$page", page).url.pathname === "/";
			return store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith(href);
		}
		head("12qhfyh", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Legajo</title>`);
			});
		});
		if (data.usuario) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="min-h-screen bg-gray-50 flex flex-col"><header class="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-md"><a href="/" class="font-bold text-lg tracking-tight">Legajo</a> <div class="flex items-center gap-3"><span class="text-sm opacity-90 hidden sm:block">${escape_html(data.usuario.nombre)}</span> <form method="POST" action="/auth?/logout"><button type="submit" class="text-sm bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded-lg transition-colors">Salir</button></form></div></header> <main class="flex-1 pb-20 sm:pb-6 max-w-2xl w-full mx-auto px-4 py-5">`);
			children($$renderer);
			$$renderer.push(`<!----></main> <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex sm:hidden z-10"><!--[-->`);
			const each_array = ensure_array_like(navItems);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				$$renderer.push(`<a${attr("href", item.href)}${attr_class(`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${stringify(isActive(item.href) ? "text-indigo-600 font-semibold" : "text-gray-500 hover:text-indigo-500")}`)}><span class="text-xl leading-none mb-0.5">${escape_html(item.icon)}</span> ${escape_html(item.label)}</a>`);
			}
			$$renderer.push(`<!--]--></nav> <nav class="hidden sm:flex fixed left-0 top-14 bottom-0 w-48 bg-white border-r border-gray-200 flex-col pt-4 px-2 gap-1"><!--[-->`);
			const each_array_1 = ensure_array_like(navItems);
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
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-BhXqoVFU.js.map
