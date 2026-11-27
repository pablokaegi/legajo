import { d as ensure_array_like, a as attr, b as attr_class, s as stringify, e as escape_html } from './dev-CsaMOlNk.js';
import { p as page } from './state-BTDbInvN.js';
import './client2-i6F8J7u1.js';
import './internal-BSUXWn6e.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/admin/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const tabs = [
			{
				href: "/admin",
				label: "Resumen",
				icon: "📊",
				exact: true
			},
			{
				href: "/admin/usuarios",
				label: "Usuarios",
				icon: "🔑"
			},
			{
				href: "/admin/status",
				label: "Moodle",
				icon: "🔌"
			},
			{
				href: "/admin/logs",
				label: "Logs",
				icon: "📜"
			},
			{
				href: "/admin/conectados",
				label: "Conectados",
				icon: "👥"
			}
		];
		function isActive(t) {
			return t.exact ? page.url.pathname === t.href : page.url.pathname.startsWith(t.href);
		}
		$$renderer.push(`<div class="space-y-4"><div><h1 class="text-xl font-bold text-gray-900">⚙️ Configuración</h1> <p class="text-xs text-gray-400">Administración del sistema — solo administradores</p></div> <div class="bg-white border border-gray-200 rounded-xl overflow-x-auto"><nav class="flex min-w-max"><!--[-->`);
		const each_array = ensure_array_like(tabs);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let tab = each_array[$$index];
			$$renderer.push(`<a${attr("href", tab.href)}${attr_class(`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${stringify(isActive(tab) ? "border-indigo-600 text-indigo-700 bg-indigo-50" : "border-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-50")}`)}><span>${escape_html(tab.icon)}</span> ${escape_html(tab.label)}</a>`);
		}
		$$renderer.push(`<!--]--></nav></div> `);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-DzBRiqjJ.js.map
