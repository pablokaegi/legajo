import { R as head, U as attr, S as escape_html, T as ensure_array_like } from './dev-BsNQnjV4.js';
import './client2-BCRM2Xnk.js';
import './internal-BAmKnqFi.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/observaciones/historial/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let filtroAlumno = data.filtros.alumno;
		let filtroCurso = data.filtros.curso;
		let exportando = false;
		let menuAlumno = null;
		const actitudLabel = (v) => [
			"",
			"😐",
			"🙂",
			"😊",
			"😄",
			"🌟"
		][v] ?? v;
		head("1ytfmno", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Historial — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center justify-between"><h1 class="text-xl font-bold text-gray-900">Historial</h1> <a href="/observaciones/nueva" class="text-sm text-indigo-600 hover:underline">+ Nueva</a></div> `);
		if (data.guardado) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">✓ Observación guardada correctamente</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="card space-y-3"><p class="text-sm font-medium text-gray-700">Buscar alumno o curso</p> <div class="grid grid-cols-2 gap-2"><div><label for="filtro-alumno" class="form-label text-xs">Alumno</label> <input id="filtro-alumno" type="search"${attr("value", filtroAlumno)} placeholder="Nombre o apellido" class="form-input text-sm py-2"/></div> <div><label for="filtro-curso" class="form-label text-xs">Curso</label> <input id="filtro-curso" type="search"${attr("value", filtroCurso)} placeholder="Nombre del curso" class="form-input text-sm py-2"/></div></div> <div class="flex gap-2"><button class="btn-primary py-2 text-sm">Buscar</button> `);
		if (filtroAlumno || filtroCurso) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="btn-secondary py-2 text-sm">Limpiar</button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div> `);
		if (data.observaciones.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-gray-500">No hay observaciones registradas</p> <a href="/observaciones/nueva" class="text-indigo-600 text-sm mt-2 inline-block">Registrar la primera</a></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="card space-y-3"><div><p class="text-sm font-medium text-gray-700">Exportar historial</p> <p class="text-xs text-gray-400">Descarga el historial visible con los filtros aplicados</p></div> <div class="grid grid-cols-2 gap-2"><button${attr("disabled", exportando, true)} class="btn-secondary py-2 text-sm">PDF</button> <button${attr("disabled", exportando, true)} class="btn-secondary py-2 text-sm">Excel</button></div></div> <p class="text-sm text-gray-500">${escape_html(data.total)} registro/s · Página ${escape_html(data.page)} de ${escape_html(data.totalPages)}</p> <div class="space-y-3"><!--[-->`);
			const each_array = ensure_array_like(data.observaciones);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let obs = each_array[$$index];
				$$renderer.push(`<div class="card space-y-2"><div class="flex items-start justify-between gap-2"><div class="min-w-0"><button class="font-semibold text-gray-900 truncate hover:text-indigo-600 transition-colors text-left">${escape_html(obs.alumnoNombre)}</button> <p class="text-xs text-gray-400 truncate">${escape_html(obs.cursoNombre)}</p></div> <div class="flex items-center gap-2 flex-shrink-0"><span class="text-xs text-gray-400">${escape_html(obs.fecha)}</span> <div class="relative"><button class="text-gray-400 hover:text-indigo-600 px-1 text-lg leading-none" title="Compartir con la familia">...</button> `);
				if (menuAlumno === obs.alumnoNombre) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 w-52"><p class="px-3 py-1.5 text-xs text-gray-400 font-medium">Compartir con la familia</p> <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Ver historial completo</button> <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Enviar por WhatsApp</button> <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Enviar por Email</button></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></div></div> <div class="flex gap-4 text-sm"><div class="flex items-center gap-1"><span class="text-gray-500">Actitud</span> <span class="font-semibold text-indigo-600">${escape_html(obs.actitud)}/5</span> <span>${escape_html(actitudLabel(obs.actitud))}</span></div> <div class="flex items-center gap-1"><span class="text-gray-500">Part.</span> <span class="font-semibold text-indigo-600">${escape_html(obs.participacion)}/5</span></div> <div class="flex items-center gap-1">`);
				if (obs.tareaCompleta) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="badge-ok">Tarea ✓</span>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="badge-error">Tarea ✗</span>`);
				}
				$$renderer.push(`<!--]--></div></div> `);
				if (obs.observacionTexto) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-sm text-gray-600 border-t border-gray-100 pt-2 italic">"${escape_html(obs.observacionTexto)}"</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div> `);
			if (data.totalPages > 1) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="flex items-center justify-center gap-3 pt-2"><button${attr("disabled", data.page <= 1, true)} class="btn-secondary py-2 px-4 text-sm w-auto">Anterior</button> <span class="text-sm text-gray-500">${escape_html(data.page)} / ${escape_html(data.totalPages)}</span> <button${attr("disabled", data.page >= data.totalPages, true)} class="btn-secondary py-2 px-4 text-sm w-auto">Siguiente</button></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-C1XJHz9P.js.map
