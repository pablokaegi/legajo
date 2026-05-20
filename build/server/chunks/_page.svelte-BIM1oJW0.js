import { h as head, e as escape_html } from './dev-BsmPEhme.js';

//#region src/routes/institucional/efemerides/nueva/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { form } = $$props;
		head("wpv0mh", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Nueva Efeméride — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div><a href="/institucional/efemerides" class="text-indigo-600 text-sm hover:underline">← Efemérides</a> <h2 class="text-lg font-bold text-gray-900 mt-1">Nueva Efeméride / Acto</h2></div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <form method="POST" class="space-y-4"><div><label class="form-label">Título del acto / efeméride *</label> <input type="text" name="titulo" required="" maxlength="200" placeholder="Ej: Acto 25 de Mayo" class="form-input"/></div> <div class="grid grid-cols-2 gap-3"><div><label class="form-label">Fecha *</label> <input type="date" name="fecha" required="" class="form-input"/></div> <div><label class="form-label">Estado</label> <select name="estado" class="form-input">`);
		$$renderer.option({ value: "planificado" }, ($$renderer) => {
			$$renderer.push(`Planificado`);
		});
		$$renderer.option({ value: "realizado" }, ($$renderer) => {
			$$renderer.push(`Realizado`);
		});
		$$renderer.option({ value: "cancelado" }, ($$renderer) => {
			$$renderer.push(`Cancelado`);
		});
		$$renderer.push(`</select></div></div> <div><label class="form-label">Descripción</label> <textarea name="descripcion" rows="3" maxlength="2000" placeholder="Detalles del acto, programa, etc." class="form-input resize-none"></textarea></div> <div><label class="form-label">Docente responsable</label> <input type="text" name="docenteResponsable" maxlength="200" placeholder="Nombre del docente a cargo" class="form-input"/></div> <div><label class="form-label">Cursos / grupos responsables</label> <textarea name="cursosResponsables" rows="3" placeholder="Un curso por línea, ej: 5° A 6° B" class="form-input resize-none font-mono text-sm"></textarea> <p class="text-xs text-gray-400 mt-1">Un curso por línea</p></div> <div><label class="form-label">Notas internas</label> <textarea name="notas" rows="2" maxlength="2000" class="form-input resize-none"></textarea></div> <div class="flex gap-3 pt-2"><button type="submit" class="btn-primary flex-1">Guardar efeméride</button> <a href="/institucional/efemerides" class="btn-secondary flex-1 text-center">Cancelar</a></div></form></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BIM1oJW0.js.map
