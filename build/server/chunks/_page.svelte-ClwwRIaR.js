import { h as head, b as attr, a as ensure_array_like, s as stringify, e as escape_html, d as derived } from './dev-gpgZwwqU.js';

//#region src/routes/pizarra/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let filtro = "";
		let cursos = derived(() => (data.cursos));
		head("16e5p32", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Modo pizarra</title>`);
			});
		});
		$$renderer.push(`<div class="max-w-5xl mx-auto space-y-4"><p class="text-2xl font-bold text-gray-900">¿Con qué curso estás?</p> <input type="search"${attr("value", filtro)} placeholder="Buscar curso…" class="w-full text-xl px-4 py-3 rounded-xl border border-gray-300 select-text"/> <div class="grid grid-cols-2 md:grid-cols-3 gap-3">`);
		const each_array = ensure_array_like(cursos());
		if (each_array.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let c = each_array[$$index];
				$$renderer.push(`<a${attr("href", `/pizarra/${stringify(c.id)}`)} class="block p-6 rounded-2xl bg-white border-2 border-gray-200 text-xl font-semibold text-gray-900 text-center active:bg-indigo-50 hover:border-indigo-400">${escape_html(c.nombre)}</a>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<p class="text-lg text-gray-500 col-span-full">No se pudieron cargar los cursos.</p>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-ClwwRIaR.js.map
