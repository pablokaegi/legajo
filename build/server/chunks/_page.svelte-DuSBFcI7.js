import { h as head, e as escape_html, b as attr, a as ensure_array_like, s as stringify, j as derived } from './dev-B1vF67ZX.js';
import './client2-DCr7IOME.js';
import './internal-BZC4M7Id.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/cursos/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let busqueda = "";
		let alumnosFiltrados = derived(() => busqueda.trim().length === 0 ? data.alumnos : data.alumnos.filter((a) => a.fullname.toLowerCase().includes(busqueda.toLowerCase())));
		head("s0lrw2", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Alumnos del curso — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-2"><a href="/cursos" class="text-indigo-600 text-sm hover:underline">← Cursos</a></div> <h1 class="text-xl font-bold text-gray-900">Alumnos</h1> `);
		if (data.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">${escape_html(data.error)}</div>`);
		} else if (data.alumnos.length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-gray-500">No hay alumnos en este curso</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<input type="search"${attr("value", busqueda)} placeholder="Buscar alumno..." class="form-input"/> <p class="text-sm text-gray-500">${escape_html(alumnosFiltrados().length)} alumno/s</p> <div class="space-y-2"><!--[-->`);
			const each_array = ensure_array_like(alumnosFiltrados());
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let alumno = each_array[$$index];
				$$renderer.push(`<div class="card flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0"><span class="text-indigo-600 font-semibold text-sm">${escape_html(alumno.firstname[0])}${escape_html(alumno.lastname[0])}</span></div> <div class="flex-1 min-w-0"><p class="font-medium text-gray-900 truncate">${escape_html(alumno.fullname)}</p> `);
				if (alumno.email) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-gray-400 truncate">${escape_html(alumno.email)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <div class="flex gap-2 flex-shrink-0"><a${attr("href", `/cursos/${stringify(data.cursoId)}/alumnos/${stringify(alumno.id)}/notas?nombre=${stringify(encodeURIComponent(alumno.fullname))}`)} class="text-sm text-indigo-600 hover:underline" title="Ver notas">📊</a> <a${attr("href", `/observaciones/nueva?cursoId=${stringify(data.cursoId)}&alumnoId=${stringify(alumno.id)}&alumnoNombre=${stringify(encodeURIComponent(alumno.fullname))}`)} class="text-sm text-indigo-600 hover:underline" title="Registrar observación">✏️</a></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DuSBFcI7.js.map
