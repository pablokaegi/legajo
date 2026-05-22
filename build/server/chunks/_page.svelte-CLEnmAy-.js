import { h as head, e as escape_html, a as ensure_array_like, b as attr, c as attr_class, s as stringify, d as derived } from './dev-BsmPEhme.js';
import './client2-Dql-Fbhv.js';
import './internal-BLrH_PeT.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/preceptor/reincorporaciones/nueva/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const preselectSingle = !!(data.preselect?.alumnoId && data.preselect?.alumnoNombre);
		const preselectBulk = !!(data.preselect?.cursoId && data.preselect?.alumnos?.length);
		let paso = preselectSingle || preselectBulk ? 3 : 1;
		let cursoSeleccionado = preselectSingle && data.preselect?.cursoId || preselectBulk ? {
			id: data.preselect.cursoId,
			nombre: data.preselect.cursoNombre ?? data.cursos.find((c) => c.id === data.preselect.cursoId)?.fullname ?? ""
		} : null;
		let alumnos = [];
		let seleccionados = preselectSingle ? new Set([data.preselect.alumnoId]) : preselectBulk ? new Set(data.preselect.alumnos.map((a) => a.id)) : /* @__PURE__ */ new Set();
		let alumnosNombres = preselectSingle ? new Map([[data.preselect.alumnoId, data.preselect.alumnoNombre ?? ""]]) : preselectBulk ? new Map(data.preselect.alumnos.map((a) => [a.id, a.fullname])) : /* @__PURE__ */ new Map();
		let cargando = false;
		let busqueda = "";
		let fechaReincorporacion = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		let observaciones = "";
		let documentoUrl = "";
		let linkedFaltaId = "";
		let alumnosFiltrados = derived(() => (alumnos));
		let alumnosPayload = derived(() => [...seleccionados].map((id) => ({
			alumnoMoodleId: id,
			alumnoNombre: alumnosNombres.get(id) ?? ""
		})));
		let nombresSeleccionados = derived(() => [...seleccionados].map((id) => alumnosNombres.get(id) ?? "").filter(Boolean));
		head("lcwlbd", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Nueva reincorporación — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-2">`);
		if (paso > 1 && !preselectSingle && !preselectBulk) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="text-indigo-600 text-sm">←</button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <a href="/preceptor/reincorporaciones" class="text-indigo-600 text-sm hover:underline">← Reincorporaciones</a> <h2 class="text-lg font-bold text-gray-900">Nueva reincorporación</h2></div> `);
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
				$$renderer.push(`<!--]--></div> <p class="font-medium text-gray-900 text-sm flex-1">${escape_html(alumno.fullname)}</p></button>`);
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
			$$renderer.push(`<div class="bg-indigo-50 rounded-lg px-3 py-2 text-sm space-y-1">`);
			if (cursoSeleccionado) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p><strong class="text-indigo-700">${escape_html(cursoSeleccionado.nombre)}</strong></p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
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
			$$renderer.push(`<!--]--></div> <form method="POST" class="space-y-4"><input type="hidden" name="alumnos"${attr("value", JSON.stringify(alumnosPayload()))}/> <div><label class="form-label">Fecha de reincorporación *</label> <input type="date" name="fechaReincorporacion"${attr("value", fechaReincorporacion)}${attr("max", (/* @__PURE__ */ new Date()).toISOString().split("T")[0])} required="" class="form-input"/></div> <div><label class="form-label">Observaciones <span class="text-gray-400 font-normal">(opcional)</span></label> <textarea name="observaciones" rows="3" maxlength="3000" placeholder="Motivo de la ausencia, acuerdo, etc." class="form-input resize-none">`);
			const $$body = escape_html(observaciones);
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea></div> <div><label class="form-label">URL de documento <span class="text-gray-400 font-normal">(opcional)</span></label> <input type="url" name="documentoUrl"${attr("value", documentoUrl)} class="form-input" placeholder="https://..."/></div> <div><label class="form-label">ID de falta relacionada <span class="text-gray-400 font-normal">(opcional)</span></label> <input type="number" name="linkedFaltaId"${attr("value", linkedFaltaId)} class="form-input" placeholder="ID de la falta que cierra"/></div> <button type="submit" class="btn-primary w-full"${attr("disabled", seleccionados.size === 0, true)}>`);
			if (seleccionados.size === 1) {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`Registrar reincorporación`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`Registrar reincorporación para ${escape_html(seleccionados.size)} alumnos`);
			}
			$$renderer.push(`<!--]--></button></form>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CLEnmAy-.js.map
