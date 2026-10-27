import { e as escape_html } from './dev-gpgZwwqU.js';

//#region src/routes/pizarra/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;
		$$renderer.push(`<div class="min-h-screen bg-slate-50 flex flex-col select-none"><header class="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200"><a href="/pizarra" class="text-lg font-bold text-indigo-700">🖥️ Modo pizarra</a> <span class="text-sm text-gray-500 hidden sm:inline">· ${escape_html(data.nombreDocente)}</span> <div class="ml-auto flex items-center gap-2"><button class="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 text-base font-medium active:bg-gray-200">${escape_html("⛶ Pantalla completa")}</button> <form method="POST" action="/auth?/logout"><input type="hidden" name="volver" value="/pizarra"/> <button type="submit" class="px-5 py-3 rounded-xl bg-red-600 text-white text-base font-bold active:bg-red-700">🚪 Cerrar sesión</button></form></div></header> <main class="flex-1 p-4">`);
		children($$renderer);
		$$renderer.push(`<!----></main> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-B_ca3C9-.js.map
