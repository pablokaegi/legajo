import { R as head, S as escape_html, V as attr_class, W as stringify, T as ensure_array_like } from './dev-BsNQnjV4.js';

//#region src/routes/institucional/efemerides/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const { ev } = data;
		const ESTADO_COLOR = {
			planificado: "bg-blue-100 text-blue-700",
			realizado: "bg-green-100 text-green-700",
			cancelado: "bg-gray-100 text-gray-500"
		};
		function parseCursos(json) {
			if (!json) return [];
			try {
				const arr = JSON.parse(json);
				if (Array.isArray(arr)) return arr.map((c) => c.cursoNombre ?? c);
			} catch {}
			return [json];
		}
		const cursos = parseCursos(ev.cursosResponsables);
		cursos.join("\n");
		head("gnap6r", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(ev.titulo)} — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div><a href="/institucional/efemerides" class="text-indigo-600 text-sm hover:underline">← Efemérides</a> <div class="flex items-center justify-between mt-1"><h2 class="text-lg font-bold text-gray-900">${escape_html(ev.titulo)}</h2> <span${attr_class(`text-xs px-2 py-0.5 rounded-full ${stringify(ESTADO_COLOR[ev.estado] ?? "bg-gray-100 text-gray-600")}`)}>${escape_html(ev.estado)}</span></div></div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="card space-y-3"><div class="flex justify-between text-sm"><span class="text-gray-500">Fecha</span> <span class="font-medium">${escape_html(ev.fecha)}</span></div> `);
		if (ev.docenteResponsable) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="flex justify-between text-sm"><span class="text-gray-500">Docente responsable</span> <span class="font-medium">${escape_html(ev.docenteResponsable)}</span></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (cursos.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="text-sm"><span class="text-gray-500">Cursos responsables</span> <div class="flex flex-wrap gap-1 mt-1"><!--[-->`);
			const each_array = ensure_array_like(cursos);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let c = each_array[$$index];
				$$renderer.push(`<span class="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">${escape_html(c)}</span>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (ev.descripcion) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="text-sm"><span class="text-gray-500 block mb-1">Descripción</span> <p class="text-gray-700 whitespace-pre-wrap">${escape_html(ev.descripcion)}</p></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (ev.notas) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="text-sm"><span class="text-gray-500 block mb-1">Notas internas</span> <p class="text-gray-600 italic whitespace-pre-wrap">${escape_html(ev.notas)}</p></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="flex gap-2"><button class="btn-secondary text-sm flex-1">✏️ Editar</button> <form method="POST" action="?/eliminar"><button type="submit" class="text-sm text-red-500 hover:text-red-700 px-3 py-2">🗑 Eliminar</button></form></div>`);
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-N6fbyO1U.js.map
