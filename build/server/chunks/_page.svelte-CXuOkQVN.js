import { h as head, e as escape_html, c as attr_class, s as stringify, a as ensure_array_like, b as attr } from './dev-BsmPEhme.js';

//#region src/routes/preceptor/actas/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const { acta } = data;
		const ESTADO_TAREA = {
			pendiente: "⏳ Pendiente",
			en_progreso: "🔄 En progreso",
			completada: "✅ Completada"
		};
		head("1lvqcsk", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(acta.titulo)} — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-2"><a href="/preceptor/actas" class="text-indigo-600 text-sm hover:underline">← Actas</a></div> <div class="card space-y-2"><div class="flex items-start justify-between gap-2"><h2 class="text-lg font-bold text-gray-900 flex-1">${escape_html(acta.titulo)}</h2> <span${attr_class(`text-xs px-2 py-1 rounded-full flex-shrink-0 ${stringify(acta.estado === "abierta" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}`)}>${escape_html(acta.estado)}</span></div> <p class="text-xs text-gray-500">📅 ${escape_html(acta.fecha)}</p></div> <div class="card space-y-2"><h3 class="text-sm font-semibold text-gray-700">Resumen</h3> <p class="text-sm text-gray-800 whitespace-pre-wrap">${escape_html(acta.resumen)}</p></div> `);
		if (acta.acuerdos) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card space-y-2"><h3 class="text-sm font-semibold text-gray-700">Acuerdos</h3> <p class="text-sm text-gray-800 whitespace-pre-wrap">${escape_html(acta.acuerdos)}</p></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (acta.alumnos.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card space-y-2"><h3 class="text-sm font-semibold text-gray-700">Alumnos involucrados</h3> <ul class="space-y-1"><!--[-->`);
			const each_array = ensure_array_like(acta.alumnos);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let alumno = each_array[$$index];
				$$renderer.push(`<li class="text-sm text-gray-700">• ${escape_html(alumno.alumnoNombre)}</li>`);
			}
			$$renderer.push(`<!--]--></ul></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (acta.asistentes.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card space-y-2"><h3 class="text-sm font-semibold text-gray-700">Asistentes</h3> <ul class="space-y-1"><!--[-->`);
			const each_array_1 = ensure_array_like(acta.asistentes);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let asistente = each_array_1[$$index_1];
				$$renderer.push(`<li class="text-sm text-gray-700">👤 ID ${escape_html(asistente.usuarioId)}${escape_html(asistente.rol ? ` — ${asistente.rol}` : "")}</li>`);
			}
			$$renderer.push(`<!--]--></ul></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (acta.tareas.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card space-y-3"><h3 class="text-sm font-semibold text-gray-700">Tareas / compromisos</h3> <div class="space-y-2"><!--[-->`);
			const each_array_2 = ensure_array_like(acta.tareas);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let tarea = each_array_2[$$index_2];
				$$renderer.push(`<div class="flex items-start gap-2 p-2 rounded-lg bg-gray-50"><span class="text-xs flex-shrink-0 mt-0.5">${escape_html(ESTADO_TAREA[tarea.estado] ?? tarea.estado)}</span> <div class="flex-1"><p class="text-sm text-gray-800">${escape_html(tarea.descripcion)}</p> `);
				if (tarea.dueDate) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-gray-400 mt-0.5">Vence: ${escape_html(tarea.dueDate)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (acta.versiones.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card space-y-2"><h3 class="text-sm font-semibold text-gray-700">Historial de ediciones (${escape_html(acta.versiones.length)})</h3> <ul class="space-y-1"><!--[-->`);
			const each_array_3 = ensure_array_like(acta.versiones);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let v = each_array_3[$$index_3];
				$$renderer.push(`<li class="text-xs text-gray-500">🕑 ${escape_html(new Date(v.createdAt).toLocaleString("es-AR"))} — editado por ID ${escape_html(v.editadoPor)}</li>`);
			}
			$$renderer.push(`<!--]--></ul></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <a${attr("href", `/api/actas/${stringify(acta.id)}`)} target="_blank" class="text-xs text-gray-400 hover:underline">Ver JSON del acta</a></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CXuOkQVN.js.map
