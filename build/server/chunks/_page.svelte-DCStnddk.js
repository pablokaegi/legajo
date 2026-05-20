import { R as head, S as escape_html, U as attr } from './dev-BjcCn9Qu.js';
import './client2-RJTSupNr.js';
import './internal-COx87Ukl.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/preceptor/reincorporaciones/nueva/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let guardando = false;
		head("lcwlbd", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Nueva reincorporación — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-2"><a href="/preceptor/reincorporaciones" class="text-indigo-600 text-sm hover:underline">← Reincorporaciones</a> <h2 class="text-lg font-bold text-gray-900">Nueva reincorporación</h2></div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <form method="POST" class="space-y-4"><div><label class="form-label">ID Moodle del alumno *</label> <input type="number" name="alumnoMoodleId"${attr("value", data.preselect.alumnoMoodleId ?? "")} required="" class="form-input"/></div> <div><label class="form-label">Nombre del alumno *</label> <input type="text" name="alumnoNombre"${attr("value", data.preselect.alumnoNombre ?? "")} required="" maxlength="200" class="form-input"/></div> <div><label class="form-label">Fecha de reincorporación *</label> <input type="date" name="fechaReincorporacion" required="" class="form-input"/></div> <div><label class="form-label">Observaciones <span class="text-gray-400 font-normal">(opcional)</span></label> <textarea name="observaciones" rows="3" maxlength="3000" class="form-input resize-none"></textarea></div> <div><label class="form-label">URL de documento <span class="text-gray-400 font-normal">(opcional)</span></label> <input type="url" name="documentoUrl" class="form-input" placeholder="https://..."/></div> <div><label class="form-label">ID de falta relacionada <span class="text-gray-400 font-normal">(opcional)</span></label> <input type="number" name="linkedFaltaId" class="form-input" placeholder="ID de la falta que cierra"/></div> <button type="submit" class="btn-primary w-full"${attr("disabled", guardando, true)}>${escape_html("Registrar reincorporación")}</button></form></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DCStnddk.js.map
