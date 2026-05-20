import { R as head, T as ensure_array_like, V as attr_class, S as escape_html, U as attr, K as derived, W as stringify } from './dev-BjcCn9Qu.js';
import './client2-greF6Fw_.js';
import './internal-BLkKJYZ7.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/observaciones/nueva/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let paso = data.preselect.cursoId && data.preselect.alumnoId ? 3 : 1;
		let cursoSeleccionado = data.preselect.cursoId ? {
			id: data.preselect.cursoId,
			nombre: data.cursos.find((c) => c.id === data.preselect.cursoId)?.fullname ?? ""
		} : null;
		let alumnoSeleccionado = data.preselect.alumnoId ? {
			id: data.preselect.alumnoId,
			nombre: data.preselect.alumnoNombre ?? ""
		} : null;
		let alumnos = [];
		let cargandoAlumnos = false;
		let busquedaAlumno = "";
		let actitud = 3;
		let tareaCompleta = true;
		let participacion = 3;
		let observacionTexto = "";
		let fecha = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		let guardando = false;
		let alumnosFiltrados = derived(() => (alumnos));
		const ESCALA = [
			1,
			2,
			3,
			4,
			5
		];
		const ESCALA_LABELS = [
			"Muy bajo",
			"Bajo",
			"Regular",
			"Bueno",
			"Excelente"
		];
		head("f36s70", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Nueva observación — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div><div class="flex items-center gap-2 mb-1">`);
		if (paso > 1) {
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
		$$renderer.push(`<!--]--></div> <p class="text-xs text-gray-400 mt-1">Paso ${escape_html(paso)} de 3</p></div> `);
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
			$$renderer.push(`<div><p class="text-sm text-gray-500 mb-3">Curso: <strong>${escape_html(cursoSeleccionado?.nombre)}</strong></p> <input type="search"${attr("value", busquedaAlumno)} placeholder="Buscar alumno..." class="form-input mb-3"/> `);
			if (alumnosFiltrados().length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="card text-center py-8"><p class="text-gray-500 text-sm">No se encontraron alumnos</p></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="space-y-2"><!--[-->`);
				const each_array_2 = ensure_array_like(alumnosFiltrados());
				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let alumno = each_array_2[$$index_2];
					$$renderer.push(`<button class="card w-full text-left flex items-center gap-3 hover:border-indigo-300 transition-colors"><div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0"><span class="text-indigo-600 font-semibold text-sm">${escape_html(alumno.firstname[0])}${escape_html(alumno.lastname[0])}</span></div> <span class="font-medium text-gray-900">${escape_html(alumno.fullname)}</span></button>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (paso === 3) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="text-sm text-gray-500 bg-indigo-50 rounded-lg px-3 py-2"><strong class="text-indigo-700">${escape_html(alumnoSeleccionado?.nombre)}</strong> <span class="mx-1">·</span> ${escape_html(cursoSeleccionado?.nombre)}</div> `);
			if (form?.error) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <form method="POST" class="space-y-5"><input type="hidden" name="alumnoMoodleId"${attr("value", alumnoSeleccionado?.id)}/> <input type="hidden" name="alumnoNombre"${attr("value", alumnoSeleccionado?.nombre)}/> <input type="hidden" name="cursoMoodleId"${attr("value", cursoSeleccionado?.id)}/> <input type="hidden" name="cursoNombre"${attr("value", cursoSeleccionado?.nombre)}/> <div><label class="form-label">Actitud</label> <div class="flex gap-2 mt-1"><!--[-->`);
			const each_array_3 = ensure_array_like(ESCALA);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let val = each_array_3[$$index_3];
				$$renderer.push(`<button type="button"${attr_class(`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${stringify(actitud === val ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-700 hover:border-indigo-300")}`)}>${escape_html(val)}</button>`);
			}
			$$renderer.push(`<!--]--></div> <p class="text-xs text-gray-400 mt-1">${escape_html(ESCALA_LABELS[actitud - 1])}</p> <input type="hidden" name="actitud"${attr("value", actitud)}/></div> <div><label class="form-label">Tarea</label> <div class="flex gap-2 mt-1"><button type="button"${attr_class(`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${stringify("bg-green-600 border-green-600 text-white")}`)}>✓ Completa</button> <button type="button"${attr_class(`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${stringify("bg-white border-gray-300 text-gray-700 hover:border-red-300")}`)}>✗ Incompleta</button></div> <input type="hidden" name="tareaCompleta"${attr("value", tareaCompleta)}/></div> <div><label class="form-label">Participación</label> <div class="flex gap-2 mt-1"><!--[-->`);
			const each_array_4 = ensure_array_like(ESCALA);
			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let val = each_array_4[$$index_4];
				$$renderer.push(`<button type="button"${attr_class(`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${stringify(participacion === val ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-700 hover:border-indigo-300")}`)}>${escape_html(val)}</button>`);
			}
			$$renderer.push(`<!--]--></div> <p class="text-xs text-gray-400 mt-1">${escape_html(ESCALA_LABELS[participacion - 1])}</p> <input type="hidden" name="participacion"${attr("value", participacion)}/></div> <div><label for="obs" class="form-label">Observación <span class="text-gray-400 font-normal">(opcional)</span></label> <textarea id="obs" name="observacionTexto" rows="3" maxlength="500" placeholder="Anotá algo brevemente..." class="form-input resize-none">`);
			const $$body = escape_html(observacionTexto);
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea> <p class="text-xs text-gray-400 text-right">${escape_html(0)}/500</p></div> <div><label for="fecha" class="form-label">Fecha</label> <input id="fecha" type="date" name="fecha"${attr("value", fecha)} class="form-input"/></div> <button type="submit" class="btn-primary"${attr("disabled", guardando, true)}>${escape_html("Guardar observación")}</button></form>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-zzdSa-pQ.js.map
