import { h as head, a as ensure_array_like, c as attr_class, e as escape_html, b as attr, s as stringify, d as derived } from './dev-BsmPEhme.js';
import './client2-BYmASMdX.js';
import './internal-BHRUkMaE.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/observaciones/nueva/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const preselectSingle = !!(data.preselect.cursoId && data.preselect.alumnoId);
		const preselectBulk = !!(data.preselect.cursoId && data.preselect.alumnos?.length);
		let paso = preselectSingle || preselectBulk ? 3 : 1;
		let cursoSeleccionado = data.preselect.cursoId ? {
			id: data.preselect.cursoId,
			nombre: data.preselect.cursoNombre ?? data.cursos.find((c) => c.id === data.preselect.cursoId)?.fullname ?? ""
		} : null;
		let alumnos = [];
		let seleccionados = preselectSingle ? new Set([data.preselect.alumnoId]) : preselectBulk ? new Set(data.preselect.alumnos.map((a) => a.id)) : /* @__PURE__ */ new Set();
		let alumnosNombres = preselectSingle ? new Map([[data.preselect.alumnoId, data.preselect.alumnoNombre ?? ""]]) : preselectBulk ? new Map(data.preselect.alumnos.map((a) => [a.id, a.fullname])) : /* @__PURE__ */ new Map();
		let cargandoAlumnos = false;
		let busquedaAlumno = "";
		let usarEvaluacion = false;
		let observacionTexto = "";
		let fecha = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		let alumnosFiltrados = derived(() => (alumnos));
		let alumnosPayload = derived(() => [...seleccionados].map((id) => ({
			alumnoMoodleId: id,
			alumnoNombre: alumnosNombres.get(id) ?? ""
		})));
		let nombresSeleccionados = derived(() => [...seleccionados].map((id) => alumnosNombres.get(id) ?? "").filter(Boolean));
		head("f36s70", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Nueva observación — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div><div class="flex items-center gap-2 mb-1">`);
		if (paso > 1 && !preselectSingle) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="text-indigo-600 text-sm">← Volver</button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <h1 class="text-xl font-bold text-gray-900">Nueva observación</h1></div> <div class="flex gap-1 mt-2"><!--[-->`);
		const each_array = ensure_array_like([
			1,
			2,
			3
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let p = each_array[$$index];
			$$renderer.push(`<div${attr_class(`h-1 flex-1 rounded-full ${stringify(p <= paso ? "bg-indigo-500" : "bg-gray-200")} transition-colors`)}></div>`);
		}
		$$renderer.push(`<!--]--></div> <p class="text-xs text-gray-400 mt-1">Paso ${escape_html(paso)} de 3${escape_html(paso === 2 && seleccionados.size > 0 ? ` — ${seleccionados.size} seleccionado/s` : "")}</p></div> `);
		if (paso === 1) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm font-medium text-gray-700">Seleccioná el curso</p> `);
			if (data.cursos.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="card text-center py-8"><p class="text-gray-500 text-sm">No hay cursos disponibles</p></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="space-y-2"><!--[-->`);
				const each_array_1 = ensure_array_like(data.cursos);
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let curso = each_array_1[$$index_1];
					$$renderer.push(`<button${attr_class(`card w-full text-left hover:border-indigo-300 transition-colors ${stringify("")}`)}${attr("disabled", cargandoAlumnos, true)}><p class="font-medium text-gray-900">${escape_html(curso.displayname || curso.fullname)}</p> <p class="text-xs text-gray-400">${escape_html(curso.shortname)}</p></button>`);
				}
				$$renderer.push(`<!--]--></div> `);
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]-->`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (paso === 2) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-indigo-50 rounded-lg px-3 py-2 text-sm"><strong class="text-indigo-700">${escape_html(cursoSeleccionado?.nombre)}</strong> <button class="ml-2 text-xs text-gray-400 hover:text-gray-700">(cambiar)</button></div> <div class="flex gap-2"><input type="search"${attr("value", busquedaAlumno)} placeholder="Buscar alumno..." class="form-input flex-1"/> <button class="text-xs text-indigo-600 hover:underline whitespace-nowrap">Todos</button> <button class="text-xs text-gray-400 hover:underline whitespace-nowrap">Ninguno</button></div> `);
			if (seleccionados.size > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="bg-indigo-600 text-white text-sm rounded-lg px-3 py-2 flex items-center justify-between"><span>${escape_html(seleccionados.size)} alumno/s seleccionado/s</span> <button class="bg-white text-indigo-600 text-xs font-semibold px-3 py-1 rounded-lg">Continuar →</button></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="space-y-2"><!--[-->`);
			const each_array_2 = ensure_array_like(alumnosFiltrados());
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let alumno = each_array_2[$$index_2];
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
			$$renderer.push(`<div class="bg-indigo-50 rounded-lg px-3 py-2 text-sm space-y-1"><p><strong class="text-indigo-700">${escape_html(cursoSeleccionado?.nombre)}</strong></p> `);
			if (nombresSeleccionados().length <= 3) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-gray-600">${escape_html(nombresSeleccionados().join(", "))}</p>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<p class="text-gray-600">${escape_html(nombresSeleccionados().slice(0, 3).join(", "))} y ${escape_html(nombresSeleccionados().length - 3)} más</p>`);
			}
			$$renderer.push(`<!--]--> `);
			if (!preselectSingle && !preselectBulk) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button class="text-xs text-gray-400 hover:underline">← cambiar selección</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> `);
			if (form?.error) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <form method="POST" class="space-y-5"><input type="hidden" name="cursoMoodleId"${attr("value", cursoSeleccionado?.id)}/> <input type="hidden" name="cursoNombre"${attr("value", cursoSeleccionado?.nombre)}/> <input type="hidden" name="alumnos"${attr("value", JSON.stringify(alumnosPayload()))}/> <input type="hidden" name="usarEvaluacion"${attr("value", "0")}/> <div class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200"><div><p class="text-sm font-medium text-gray-800">Incluir evaluación</p> <p class="text-xs text-gray-400">Actitud, tarea y participación</p></div> <button type="button"${attr_class(`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${stringify("bg-gray-300")}`)} role="switch"${attr("aria-checked", usarEvaluacion)} aria-label="Activar evaluación"><span${attr_class(`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${stringify("translate-x-1")}`)}></span></button></div> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div><label for="obs" class="form-label">Observación <span class="text-gray-400 font-normal">(opcional)</span></label> <textarea id="obs" name="observacionTexto" rows="3" maxlength="500" placeholder="Ej: No trajo el permiso firmado para el viaje de estudios..." class="form-input resize-none">`);
			const $$body = escape_html(observacionTexto);
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea> <p class="text-xs text-gray-400 text-right">${escape_html(0)}/500</p></div> <div><label for="fecha" class="form-label">Fecha</label> <input id="fecha" type="date" name="fecha"${attr("value", fecha)}${attr("max", (/* @__PURE__ */ new Date()).toISOString().split("T")[0])} class="form-input"/></div> <button type="submit" class="btn-primary w-full"${attr("disabled", seleccionados.size === 0, true)}>`);
			if (seleccionados.size === 1) {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`Guardar observación`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`Guardar observación para ${escape_html(seleccionados.size)} alumnos`);
			}
			$$renderer.push(`<!--]--></button></form>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CcxJCMtw.js.map
