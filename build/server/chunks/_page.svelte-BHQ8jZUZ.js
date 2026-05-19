import { R as head, S as escape_html, T as ensure_array_like, U as attr, W as stringify } from './dev-BjcCn9Qu.js';

//#region src/routes/cursos/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
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
			$$renderer.push(`<p class="text-sm text-gray-500">${escape_html(data.cursos.length)} cursos disponibles</p> <div class="space-y-2"><!--[-->`);
			const each_array = ensure_array_like(data.cursos);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let curso = each_array[$$index];
				$$renderer.push(`<a${attr("href", `/cursos/${stringify(curso.id)}`)} class="card flex items-center justify-between hover:border-indigo-300 transition-colors group"><div class="min-w-0"><p class="font-medium text-gray-900 truncate">${escape_html(curso.displayname || curso.fullname)}</p> <p class="text-xs text-gray-400 mt-0.5">${escape_html(curso.shortname)}</p></div> <span class="text-gray-300 group-hover:text-indigo-400 transition-colors ml-3 flex-shrink-0">→</span></a>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BHQ8jZUZ.js.map
