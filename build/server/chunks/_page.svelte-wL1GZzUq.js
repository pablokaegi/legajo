import { R as head, S as escape_html, U as attr, T as ensure_array_like, W as stringify, K as derived } from './dev-BjcCn9Qu.js';

//#region src/routes/cursos/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let busqueda = "";
		let cursosFiltrados = derived(() => busqueda.trim().length === 0 ? data.cursos : data.cursos.filter((c) => `${c.displayname ?? c.fullname} ${c.shortname}`.toLowerCase().includes(busqueda.toLowerCase())));
		head("1reftfu", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Cursos — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><h1 class="text-xl font-bold text-gray-900">Cursos</h1> `);
		if (data.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3"><p class="font-medium">No se pudieron cargar los cursos</p> <p class="mt-1 text-xs">${escape_html(data.error)}</p></div>`);
		} else if (data.cursos.length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-gray-500">No hay cursos disponibles</p> <p class="text-xs text-gray-400 mt-1">Verificá los permisos del token en Moodle</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span> <input type="search"${attr("value", busqueda)} placeholder="Buscar curso..." class="form-input pl-8" autofocus=""/></div> <p class="text-sm text-gray-500">${escape_html(cursosFiltrados().length)} de ${escape_html(data.cursos.length)} cursos</p> `);
			if (cursosFiltrados().length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="card text-center py-8"><p class="text-gray-500 text-sm">No hay cursos que coincidan con "<strong>${escape_html(busqueda)}</strong>"</p> <button class="text-indigo-600 text-xs mt-2 hover:underline">Limpiar búsqueda</button></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="space-y-2"><!--[-->`);
				const each_array = ensure_array_like(cursosFiltrados());
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let curso = each_array[$$index];
					$$renderer.push(`<a${attr("href", `/cursos/${stringify(curso.id)}?nombre=${stringify(encodeURIComponent(curso.displayname || curso.fullname))}`)} class="card flex items-center justify-between hover:border-indigo-300 transition-colors group"><div class="min-w-0"><p class="font-medium text-gray-900 truncate">${escape_html(curso.displayname || curso.fullname)}</p> <p class="text-xs text-gray-400 mt-0.5">${escape_html(curso.shortname)}</p></div> <span class="text-gray-300 group-hover:text-indigo-400 transition-colors ml-3 flex-shrink-0 text-lg">→</span></a>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-wL1GZzUq.js.map
