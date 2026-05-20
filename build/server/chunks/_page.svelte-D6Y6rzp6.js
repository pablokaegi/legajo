import { R as head, S as escape_html, U as attr, T as ensure_array_like, V as attr_class, W as stringify } from './dev-BjcCn9Qu.js';
import './client2-BbeknYov.js';
import './internal-D23wkZPK.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/preceptor/amonestaciones/nueva/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let fecha = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		let gravedad = "leve";
		let guardando = false;
		head("4nl2er", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Nueva amonestación — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-2"><a href="/preceptor/amonestaciones" class="text-indigo-600 text-sm hover:underline">← Amonestaciones</a> <h2 class="text-lg font-bold text-gray-900">Nueva amonestación</h2></div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <form method="POST" class="space-y-4"><input type="hidden" name="cursoMoodleId"${attr("value", data.preselect.cursoMoodleId ?? "")}/> <input type="hidden" name="cursoNombre"${attr("value", data.preselect.cursoNombre ?? "")}/> <div><label class="form-label">Alumno *</label> <input type="number" name="alumnoMoodleId"${attr("value", data.preselect.alumnoMoodleId ?? "")} required="" class="form-input" placeholder="ID Moodle del alumno"/></div> <div><label class="form-label">Nombre del alumno *</label> <input type="text" name="alumnoNombre"${attr("value", data.preselect.alumnoNombre ?? "")} required="" maxlength="200" class="form-input"/></div> <div><label class="form-label">Fecha *</label> <input type="date" name="fecha"${attr("value", fecha)}${attr("max", (/* @__PURE__ */ new Date()).toISOString().split("T")[0])} required="" class="form-input"/></div> <div><label class="form-label">Gravedad *</label> <div class="flex gap-2 mt-1"><!--[-->`);
		const each_array = ensure_array_like([
			["leve", "🟡 Leve"],
			["mediana", "🟠 Mediana"],
			["grave", "🔴 Grave"]
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [val, lbl] = each_array[$$index];
			$$renderer.push(`<button type="button"${attr_class(`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${stringify(gravedad === val ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-700 hover:border-indigo-300")}`)}>${escape_html(lbl)}</button>`);
		}
		$$renderer.push(`<!--]--></div> <input type="hidden" name="gravedad"${attr("value", gravedad)}/></div> <div><label class="form-label">Motivo *</label> <textarea name="motivo" rows="4" required="" maxlength="3000" class="form-input resize-none" placeholder="Describí el motivo de la amonestación..."></textarea></div> <div><label class="form-label">Acciones sugeridas <span class="text-gray-400 font-normal">(opcional)</span></label> <textarea name="accionesSugeridas" rows="3" maxlength="2000" class="form-input resize-none" placeholder="Medidas o acuerdos sugeridos..."></textarea></div> <button type="submit" class="btn-primary w-full"${attr("disabled", guardando, true)}>${escape_html("Registrar amonestación")}</button></form></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-D6Y6rzp6.js.map
