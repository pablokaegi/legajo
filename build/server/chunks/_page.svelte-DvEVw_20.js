import { h as head, e as escape_html, a as ensure_array_like, b as attr, c as attr_class, s as stringify, d as derived } from './dev-BsmPEhme.js';
import './client2-DAWEgQoO.js';
import './internal--VVhw5xG.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/preceptor/faltas/nueva/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const preselectActivo = !!data.preselect && data.preselect.alumnos.length > 0;
		let cursoSeleccionado = preselectActivo ? {
			id: data.preselect.cursoId,
			nombre: data.preselect.cursoNombre
		} : null;
		let alumnos = preselectActivo ? data.preselect.alumnos : [];
		let seleccionados = preselectActivo ? new Set(data.preselect.alumnos.map((a) => a.id)) : /* @__PURE__ */ new Set();
		let alumnosNombres = preselectActivo ? new Map(data.preselect.alumnos.map((a) => [a.id, a.fullname])) : /* @__PURE__ */ new Map();
		let cargando = false;
		let busqueda = "";
		let fecha = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		let tipo = "ausente";
		let descripcion = "";
		let visibilidad = "publica";
		let paso = preselectActivo ? 3 : 1;
		let alumnosFiltrados = derived(() => (alumnos));
		let alumnosPayload = derived(() => [...seleccionados].map((id) => ({
			alumnoMoodleId: id,
			alumnoNombre: alumnosNombres.get(id) ?? ""
		})));
		head("1y4ew7n", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Nueva falta — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-2"><a href="/preceptor/faltas" class="text-indigo-600 text-sm hover:underline">← Faltas</a> <h2 class="text-lg font-bold text-gray-900">Nueva falta</h2></div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (paso === 1) {
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
					$$renderer.push(`<button${attr("disabled", cargando, true)}${attr_class(`card w-full text-left hover:border-indigo-300 transition-colors ${stringify("")}`)}><p class="font-medium text-gray-900">${escape_html(curso.displayname || curso.fullname)}</p> <p class="text-xs text-gray-400">${escape_html(curso.shortname)}</p></button>`);
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
			$$renderer.push(`<div class="bg-indigo-50 rounded-lg px-3 py-2 text-sm"><strong class="text-indigo-700">${escape_html(cursoSeleccionado?.nombre)}</strong> <button class="ml-2 text-xs text-gray-400 hover:text-gray-700">(cambiar)</button></div> <div class="flex gap-2"><input type="search"${attr("value", busqueda)} placeholder="Buscar alumno..." class="form-input flex-1"/> <button class="text-xs text-indigo-600 hover:underline whitespace-nowrap">Todos</button> <button class="text-xs text-gray-400 hover:underline whitespace-nowrap">Ninguno</button></div> `);
			if (seleccionados.size > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="bg-indigo-600 text-white text-sm rounded-lg px-3 py-2 flex items-center justify-between"><span>${escape_html(seleccionados.size)} alumno/s seleccionado/s</span> <button class="bg-white text-indigo-600 text-xs font-semibold px-3 py-1 rounded-lg">Continuar →</button></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="space-y-2"><!--[-->`);
			const each_array_1 = ensure_array_like(alumnosFiltrados());
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let alumno = each_array_1[$$index_1];
				$$renderer.push(`<button${attr_class(`card w-full text-left flex items-center gap-3 transition-colors ${stringify(seleccionados.has(alumno.id) ? "border-indigo-400 bg-indigo-50" : "hover:border-indigo-200")}`)}><div${attr_class(`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${stringify(seleccionados.has(alumno.id) ? "bg-indigo-600 border-indigo-600" : "border-gray-300")}`)}>`);
				if (seleccionados.has(alumno.id)) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="text-white text-xs font-bold">✓</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <div class="flex-1"><p class="font-medium text-gray-900 text-sm">${escape_html(alumno.fullname)}</p></div></button>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (paso === 3) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-indigo-50 rounded-lg px-3 py-2 text-sm space-y-1"><p><strong class="text-indigo-700">${escape_html(cursoSeleccionado?.nombre)}</strong></p> <p class="text-gray-600">${escape_html(seleccionados.size)} alumno/s seleccionado/s</p> `);
			if (!preselectActivo) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button class="text-xs text-gray-400 hover:underline">← cambiar selección</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <form method="POST" class="space-y-4"><input type="hidden" name="cursoMoodleId"${attr("value", cursoSeleccionado?.id)}/> <input type="hidden" name="cursoNombre"${attr("value", cursoSeleccionado?.nombre)}/> <input type="hidden" name="alumnos"${attr("value", JSON.stringify(alumnosPayload()))}/> <div><label class="form-label">Fecha</label> <input type="date" name="fecha"${attr("value", fecha)}${attr("max", (/* @__PURE__ */ new Date()).toISOString().split("T")[0])} class="form-input" required=""/></div> <div><label class="form-label">Tipo</label> `);
			$$renderer.select({
				name: "tipo",
				value: tipo,
				class: "form-input",
				required: true
			}, ($$renderer) => {
				$$renderer.option({ value: "ausente" }, ($$renderer) => {
					$$renderer.push(`Ausente`);
				});
				$$renderer.option({ value: "retraso" }, ($$renderer) => {
					$$renderer.push(`Retraso`);
				});
				$$renderer.option({ value: "salida_anticipada" }, ($$renderer) => {
					$$renderer.push(`Salida anticipada`);
				});
				$$renderer.option({ value: "otra" }, ($$renderer) => {
					$$renderer.push(`Otra`);
				});
			});
			$$renderer.push(`</div> <div><label class="form-label">Descripción <span class="text-gray-400 font-normal">(opcional)</span></label> <textarea name="descripcion" rows="3" maxlength="2000" class="form-input resize-none" placeholder="Detalle adicional...">`);
			const $$body = escape_html(descripcion);
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea></div> <div><label class="form-label">Visibilidad</label> <div class="flex gap-2 mt-1"><!--[-->`);
			const each_array_2 = ensure_array_like([["publica", "🌐 Pública"], ["interna", "🔒 Interna"]]);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let [val, lbl] = each_array_2[$$index_2];
				$$renderer.push(`<button type="button"${attr_class(`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${stringify(visibilidad === val ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-700 hover:border-indigo-300")}`)}>${escape_html(lbl)}</button>`);
			}
			$$renderer.push(`<!--]--></div> <input type="hidden" name="visibilidad"${attr("value", visibilidad)}/></div> <button type="submit" class="btn-primary w-full"${attr("disabled", seleccionados.size === 0, true)}>${escape_html(`Registrar falta para ${seleccionados.size} alumno/s`)}</button></form>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DvEVw_20.js.map
