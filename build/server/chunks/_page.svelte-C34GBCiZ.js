import { h as head, e as escape_html, a as ensure_array_like, b as attr, c as attr_class, d as derived, s as stringify } from './dev-BsmPEhme.js';
import './client2-pAhl18Gk.js';
import './internal-BD2vGZNk.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/preceptor/amonestaciones/nueva/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const preselectActivo = !!data.preselect?.alumnoMoodleId && !!data.preselect?.alumnoNombre;
		let cursoSeleccionado = preselectActivo && data.preselect?.cursoMoodleId ? {
			id: data.preselect.cursoMoodleId,
			nombre: data.preselect.cursoNombre
		} : null;
		let alumnoSeleccionado = preselectActivo ? {
			id: data.preselect.alumnoMoodleId,
			fullname: data.preselect.alumnoNombre
		} : null;
		let alumnos = [];
		let cargando = false;
		let busqueda = "";
		let guardando = false;
		let fecha = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		let gravedad = "leve";
		let paso = preselectActivo ? 3 : 1;
		let alumnosFiltrados = derived(() => (alumnos));
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
		$$renderer.push(`<!--]--> `);
		if (paso === 1) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm font-medium text-gray-700">Paso 1 — Seleccioná el curso</p> `);
			if (data.cursos.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="card text-center py-8"><p class="text-gray-500 text-sm">No hay cursos disponibles</p></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="space-y-2"><!--[-->`);
				const each_array = ensure_array_like(data.cursos);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let curso = each_array[$$index];
					$$renderer.push(`<button${attr("disabled", cargando, true)}${attr_class(`card w-full text-left hover:border-indigo-300 transition-colors ${stringify("")}`)}><p class="font-medium text-gray-900 text-sm">${escape_html(curso.displayname || curso.fullname)}</p> <p class="text-xs text-gray-400">${escape_html(curso.shortname)}</p></button>`);
				}
				$$renderer.push(`<!--]--></div> `);
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]-->`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (paso === 2) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-indigo-50 rounded-lg px-3 py-2 text-sm"><strong class="text-indigo-700">${escape_html(cursoSeleccionado?.nombre)}</strong> <button class="ml-2 text-xs text-gray-400 hover:text-gray-700">(cambiar curso)</button></div> <p class="text-sm font-medium text-gray-700">Paso 2 — Seleccioná el alumno</p> <input type="text"${attr("value", busqueda)} placeholder="Buscar alumno..." class="form-input w-full text-sm"/> <div class="space-y-2 max-h-96 overflow-y-auto"><!--[-->`);
			const each_array_1 = ensure_array_like(alumnosFiltrados());
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let alumno = each_array_1[$$index_1];
				$$renderer.push(`<button class="card w-full text-left hover:border-indigo-300 transition-colors"><p class="font-medium text-gray-900 text-sm">${escape_html(alumno.fullname)}</p></button>`);
			}
			$$renderer.push(`<!--]--> `);
			if (alumnosFiltrados().length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-sm text-gray-400 text-center py-4">Sin coincidencias</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (paso === 3) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-indigo-50 rounded-lg px-3 py-2 text-sm space-y-0.5">`);
			if (cursoSeleccionado) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-xs text-gray-500">${escape_html(cursoSeleccionado.nombre)}</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <p class="font-semibold text-indigo-700">👤 ${escape_html(alumnoSeleccionado?.fullname)}</p> `);
			if (!preselectActivo) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button class="text-xs text-gray-400 hover:underline">← cambiar alumno</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <form method="POST" class="space-y-4"><input type="hidden" name="alumnoMoodleId"${attr("value", alumnoSeleccionado?.id)}/> <input type="hidden" name="alumnoNombre"${attr("value", alumnoSeleccionado?.fullname)}/> <input type="hidden" name="cursoMoodleId"${attr("value", cursoSeleccionado?.id ?? "")}/> <input type="hidden" name="cursoNombre"${attr("value", cursoSeleccionado?.nombre ?? "")}/> <div><label class="form-label">Fecha *</label> <input type="date" name="fecha"${attr("value", fecha)}${attr("max", (/* @__PURE__ */ new Date()).toISOString().split("T")[0])} required="" class="form-input"/></div> <div><label class="form-label">Gravedad *</label> <div class="flex gap-2 mt-1"><!--[-->`);
			const each_array_2 = ensure_array_like([
				["leve", "🟡 Leve"],
				["mediana", "🟠 Mediana"],
				["grave", "🔴 Grave"]
			]);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let [val, lbl] = each_array_2[$$index_2];
				$$renderer.push(`<button type="button"${attr_class(`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${stringify(gravedad === val ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-700 hover:border-indigo-300")}`)}>${escape_html(lbl)}</button>`);
			}
			$$renderer.push(`<!--]--></div> <input type="hidden" name="gravedad"${attr("value", gravedad)}/></div> <div><label class="form-label">Motivo *</label> <textarea name="motivo" rows="4" required="" maxlength="3000" class="form-input resize-none" placeholder="Describí el motivo de la amonestación..."></textarea></div> <div><label class="form-label">Acciones sugeridas <span class="text-gray-400 font-normal">(opcional)</span></label> <textarea name="accionesSugeridas" rows="3" maxlength="2000" class="form-input resize-none" placeholder="Medidas o acuerdos sugeridos..."></textarea></div> <button type="submit" class="btn-primary w-full"${attr("disabled", guardando, true)}>${escape_html("Registrar amonestación")}</button></form>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-C34GBCiZ.js.map
