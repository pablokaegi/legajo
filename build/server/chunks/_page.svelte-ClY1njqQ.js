import { h as head, e as escape_html, a as ensure_array_like } from './dev-BsmPEhme.js';
import './client2-BvAzDFwX.js';
import './internal-D5u_NZ7g.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/institucional/agrupamientos/nueva/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		(/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		head("1u1mpyx", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Nueva sesión de agrupamiento — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-2"><a href="/institucional/agrupamientos" class="text-indigo-600 text-sm hover:underline">← Agrupamientos</a> <h2 class="text-lg font-bold text-gray-900">Nueva sesión</h2></div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm font-medium text-gray-700">Seleccioná el curso</p> `);
			if (data.cursos.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="card text-center py-8"><p class="text-gray-500 text-sm">No hay cursos disponibles</p></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="space-y-2"><!--[-->`);
				const each_array = ensure_array_like(data.cursos);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let curso = each_array[$$index];
					$$renderer.push(`<button class="card w-full text-left hover:border-indigo-300 transition-colors"><p class="font-medium text-gray-900">${escape_html(curso.displayname || curso.fullname)}</p> <p class="text-xs text-gray-400">${escape_html(curso.shortname)}</p></button>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-ClY1njqQ.js.map
