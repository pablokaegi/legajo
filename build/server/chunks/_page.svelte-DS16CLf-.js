import { R as head, S as escape_html, T as ensure_array_like, V as attr_class, W as stringify, U as attr } from './dev-BsNQnjV4.js';

//#region src/routes/preceptor/legajo/[alumnoId]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const { legajo } = data;
		let seccion = "observaciones";
		const tabs = [
			{
				id: "observaciones",
				label: "Observaciones",
				emoji: "📝",
				count: legajo.observaciones.length
			},
			{
				id: "faltas",
				label: "Faltas",
				emoji: "📅",
				count: legajo.faltas.length
			},
			{
				id: "amonestaciones",
				label: "Amonestaciones",
				emoji: "⚠️",
				count: legajo.amonestaciones.length
			},
			{
				id: "actas",
				label: "Actas",
				emoji: "📄",
				count: legajo.actas.length
			}
		];
		head("gvai8q", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(legajo.alumnoNombre)} — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div><a href="javascript:history.back()" class="text-indigo-600 text-sm hover:underline">← Volver</a> <div class="mt-2 flex items-center gap-3"><div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0"><span class="text-indigo-700 font-bold text-lg">${escape_html(legajo.alumnoNombre.charAt(0).toUpperCase())}</span></div> <div><h1 class="text-xl font-bold text-gray-900">${escape_html(legajo.alumnoNombre)}</h1> <p class="text-xs text-gray-400">Moodle ID: ${escape_html(legajo.alumnoMoodleId)}</p></div></div></div> <div class="grid grid-cols-4 gap-2"><div class="bg-blue-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-blue-600">${escape_html(legajo.observaciones.length)}</p> <p class="text-xs text-blue-500">Obs.</p></div> <div class="bg-red-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-red-600">${escape_html(legajo.faltas.length)}</p> <p class="text-xs text-red-500">Faltas</p></div> <div class="bg-orange-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-orange-600">${escape_html(legajo.amonestaciones.length)}</p> <p class="text-xs text-orange-500">Amon.</p></div> <div class="bg-green-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-green-600">${escape_html(legajo.actas.length)}</p> <p class="text-xs text-green-500">Actas</p></div></div> <div class="flex gap-1 overflow-x-auto pb-1 border-b border-gray-200"><!--[-->`);
		const each_array = ensure_array_like(tabs);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let tab = each_array[$$index];
			$$renderer.push(`<button${attr_class(`flex-shrink-0 text-xs px-3 py-2 rounded-t-lg transition-colors font-medium ${stringify(seccion === tab.id ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100")}`)}>${escape_html(tab.emoji)} ${escape_html(tab.label)} `);
			if (tab.count > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span${attr_class(`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${stringify(seccion === tab.id ? "bg-indigo-400 text-white" : "bg-gray-200 text-gray-600")}`)}>${escape_html(tab.count)}</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></button>`);
		}
		$$renderer.push(`<!--]--></div> `);
		{
			$$renderer.push("<!--[0-->");
			if (legajo.observaciones.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="card text-center py-8"><p class="text-2xl mb-2">📝</p> <p class="text-gray-500 text-sm">Sin observaciones registradas.</p> <a${attr("href", `/observaciones/nueva?alumnoId=${stringify(legajo.alumnoMoodleId)}&alumnoNombre=${stringify(encodeURIComponent(legajo.alumnoNombre))}`)} class="mt-2 inline-block text-sm text-indigo-600 hover:underline">Registrar observación</a></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="space-y-2"><!--[-->`);
				const each_array_1 = ensure_array_like(legajo.observaciones);
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let obs = each_array_1[$$index_1];
					$$renderer.push(`<div class="card space-y-1"><div class="flex items-center justify-between"><span class="text-xs text-gray-400">📅 ${escape_html(obs.fecha)}</span> `);
					if (obs.cursoNombre) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="text-xs text-gray-500">${escape_html(obs.cursoNombre)}</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div> `);
					if (obs.observacionTexto) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<p class="text-sm text-gray-700">${escape_html(obs.observacionTexto)}</p>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					if (obs.actitud != null || obs.tareaCompleta != null || obs.participacion != null) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="flex gap-3 text-xs text-gray-500 pt-1">`);
						if (obs.actitud != null) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span>Actitud: <strong>${escape_html(obs.actitud)}/5</strong></span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--> `);
						if (obs.tareaCompleta != null) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span>Tarea: <strong>${escape_html(obs.tareaCompleta ? "✓" : "✗")}</strong></span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--> `);
						if (obs.participacion != null) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span>Participación: <strong>${escape_html(obs.participacion)}/5</strong></span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></div>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="pt-2 border-t border-gray-100"><p class="text-xs text-gray-400 mb-2">Acciones rápidas</p> <div class="flex flex-wrap gap-2"><a${attr("href", `/observaciones/nueva?alumnoId=${stringify(legajo.alumnoMoodleId)}&alumnoNombre=${stringify(encodeURIComponent(legajo.alumnoNombre))}`)} class="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">✏️ Observación</a> <a${attr("href", `/preceptor/faltas/nueva?alumnoId=${stringify(legajo.alumnoMoodleId)}&alumnoNombre=${stringify(encodeURIComponent(legajo.alumnoNombre))}`)} class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors">📅 Falta</a> <a${attr("href", `/preceptor/amonestaciones/nueva?alumnoMoodleId=${stringify(legajo.alumnoMoodleId)}&alumnoNombre=${stringify(encodeURIComponent(legajo.alumnoNombre))}`)} class="text-xs px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">⚠️ Amonestación</a> <a href="/preceptor/actas/nueva" class="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors">📄 Acta</a></div></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DS16CLf-.js.map
