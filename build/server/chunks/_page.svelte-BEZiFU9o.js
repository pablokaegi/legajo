import { R as head, S as escape_html, U as attr, T as ensure_array_like } from './dev-BjcCn9Qu.js';
import './client2-CdDZTiDs.js';
import './internal-WwHtxc04.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/preceptor/actas/nueva/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { form } = $$props;
		let guardando = false;
		let fecha = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		let tareas = [];
		head("1v4xjti", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Nueva acta — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-2"><a href="/preceptor/actas" class="text-indigo-600 text-sm hover:underline">← Actas</a> <h2 class="text-lg font-bold text-gray-900">Nueva acta</h2></div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <form method="POST" class="space-y-4"><input type="hidden" name="tareas"${attr("value", JSON.stringify(tareas))}/> <input type="hidden" name="asistentes" value="[]"/> <div><label class="form-label">Fecha *</label> <input type="date" name="fecha"${attr("value", fecha)} required="" class="form-input"/></div> <div><label class="form-label">Título *</label> <input type="text" name="titulo" required="" maxlength="300" class="form-input" placeholder="Ej: Reunión de seguimiento — 3°A"/></div> <div><label class="form-label">Resumen / Descripción *</label> <textarea name="resumen" rows="5" required="" maxlength="10000" class="form-input resize-none" placeholder="Describí los temas tratados..."></textarea></div> <div><label class="form-label">Acuerdos <span class="text-gray-400 font-normal">(opcional)</span></label> <textarea name="acuerdos" rows="3" maxlength="10000" class="form-input resize-none" placeholder="Acuerdos tomados en la reunión..."></textarea></div> <div class="space-y-2"><div class="flex items-center justify-between"><label class="form-label mb-0">Tareas / compromisos</label> <button type="button" class="text-sm text-indigo-600 hover:underline">+ Agregar tarea</button></div> <!--[-->`);
		const each_array = ensure_array_like(tareas);
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let tarea = each_array[i];
			$$renderer.push(`<div class="card border-indigo-200 space-y-2"><input type="text"${attr("value", tarea.descripcion)} placeholder="Describí la tarea..." class="form-input text-sm" maxlength="2000"/> <div class="flex gap-2 items-center"><input type="date"${attr("value", tarea.dueDate)} class="form-input text-sm flex-1"/> <button type="button" class="text-xs text-red-400 hover:text-red-600">✕ quitar</button></div></div>`);
		}
		$$renderer.push(`<!--]--></div> <button type="submit" class="btn-primary w-full"${attr("disabled", guardando, true)}>${escape_html("Crear acta")}</button></form></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BEZiFU9o.js.map
