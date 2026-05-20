import { R as head, U as attr, W as stringify, S as escape_html, V as attr_class, a8 as attr_style, T as ensure_array_like, K as derived } from './dev-BsNQnjV4.js';

//#region src/routes/cursos/[id]/alumnos/[alumnoId]/notas/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const MODULO_ICON = {
			assign: "📝",
			quiz: "❓",
			forum: "💬",
			workshop: "🔧",
			scorm: "📦",
			h5pactivity: "🎮",
			choice: "✅"
		};
		let totalCurso = derived(() => data.grades?.gradeitems.find((i) => i.itemtype === "course") ?? null);
		let items = derived(() => data.grades?.gradeitems.filter((i) => i.itemtype !== "course") ?? []);
		function iconForModule(mod) {
			if (!mod) return "📋";
			return MODULO_ICON[mod] ?? "📋";
		}
		function colorNota(percent) {
			if (percent === null) return "text-gray-400";
			if (percent >= 60) return "text-green-600";
			if (percent >= 40) return "text-yellow-600";
			return "text-red-600";
		}
		head("1mmi0qu", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Notas — ${escape_html(data.alumnoNombre)} — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-2"><a${attr("href", `/cursos/${stringify(data.courseId)}`)} class="text-indigo-600 text-sm hover:underline">← Alumnos</a></div> <div><h1 class="text-xl font-bold text-gray-900">${escape_html(data.alumnoNombre)}</h1> `);
		if (data.cursoNombre) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm text-gray-500">${escape_html(data.cursoNombre)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (data.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">${escape_html(data.error)}</div>`);
		} else if (!data.grades || items().length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-gray-500">No hay calificaciones registradas para este alumno</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			if (totalCurso()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="card bg-indigo-50 border-indigo-200"><div class="flex items-center justify-between"><div><p class="text-xs text-indigo-500 font-medium uppercase tracking-wide">Promedio general</p> <p${attr_class(`text-2xl font-bold ${stringify(colorNota(totalCurso().gradepercent))} mt-0.5`)}>${escape_html(totalCurso().gradeformatted)}</p></div> `);
				if (totalCurso().gradepercent !== null) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="text-right"><p class="text-sm text-gray-500">${escape_html(Math.round(totalCurso().gradepercent))}%</p> <div class="w-24 h-2 bg-gray-200 rounded-full mt-1"><div${attr_class(`h-2 rounded-full ${stringify(totalCurso().gradepercent >= 60 ? "bg-green-500" : totalCurso().gradepercent >= 40 ? "bg-yellow-500" : "bg-red-500")}`)}${attr_style(`width: ${stringify(Math.min(totalCurso().gradepercent, 100))}%`)}></div></div></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <p class="text-sm text-gray-500">${escape_html(items().length)} actividad/es</p> <div class="space-y-2"><!--[-->`);
			const each_array = ensure_array_like(items());
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				$$renderer.push(`<div class="card"><div class="flex items-start gap-3"><span class="text-xl flex-shrink-0 mt-0.5">${escape_html(iconForModule(item.itemmodule))}</span> <div class="flex-1 min-w-0"><p class="font-medium text-gray-900 truncate">${escape_html(item.itemname ?? "Sin nombre")}</p> `);
				if (item.itemmodule) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-gray-400 capitalize">${escape_html(item.itemmodule)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (item.feedback) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-gray-500 mt-1 italic">"${escape_html(item.feedback)}"</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <div class="text-right flex-shrink-0">`);
				if (item.graderaw === null) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-sm text-gray-400">Sin calificar</p>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<p${attr_class(`text-lg font-bold ${stringify(colorNota(item.gradepercent))}`)}>${escape_html(item.gradeformatted)}</p> <p class="text-xs text-gray-400">/ ${escape_html(item.grademax)}</p>`);
				}
				$$renderer.push(`<!--]--></div></div> `);
				if (item.graderaw !== null && item.gradepercent !== null) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="w-full h-1.5 bg-gray-100 rounded-full mt-2"><div${attr_class(`h-1.5 rounded-full ${stringify(item.gradepercent >= 60 ? "bg-green-400" : item.gradepercent >= 40 ? "bg-yellow-400" : "bg-red-400")}`)}${attr_style(`width: ${stringify(Math.min(item.gradepercent, 100))}%`)}></div></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div> <a${attr("href", `/observaciones/nueva?cursoId=${stringify(data.courseId)}&alumnoId=${stringify(data.userId)}&alumnoNombre=${stringify(encodeURIComponent(data.alumnoNombre))}`)} class="btn-primary w-full text-center block">✏️ Registrar observación</a>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DW-sLAwd.js.map
