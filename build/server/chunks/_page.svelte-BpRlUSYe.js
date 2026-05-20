import { R as head, S as escape_html, U as attr, T as ensure_array_like, V as attr_class, W as stringify, K as derived, X as store_get, Y as unsubscribe_stores } from './dev-BjcCn9Qu.js';
import { p as page } from './stores-DVWh9RGv.js';
import './client2-DDdpoIii.js';
import './internal-BIpBXcnr.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/cursos/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let busqueda = "";
		let seleccionados = /* @__PURE__ */ new Set();
		const esPreceptorODir = derived(() => store_get($$store_subs ??= {}, "$page", page).data.usuario?.roles?.some((r) => ["preceptor", "directivo"].includes(r)) ?? false);
		let alumnosFiltrados = derived(() => busqueda.trim().length === 0 ? data.alumnos : data.alumnos.filter((a) => a.fullname.toLowerCase().includes(busqueda.toLowerCase())));
		function urlBulk(destino) {
			const ids = [...seleccionados].join(",");
			const base = `/preceptor/${destino}/nueva`;
			if (destino === "faltas") return `${base}?cursoId=${data.cursoId}&alumnos=${ids}`;
			if (seleccionados.size === 1) {
				const id = [...seleccionados][0];
				const alumno = data.alumnos.find((a) => a.id === id);
				const nombre = encodeURIComponent(alumno?.fullname ?? "");
				return `${base}?cursoId=${data.cursoId}&alumnoId=${id}&alumnoNombre=${nombre}`;
			}
			return `${base}?cursoId=${data.cursoId}&alumnos=${ids}`;
		}
		head("s0lrw2", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Alumnos del curso — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-2"><a href="/cursos" class="text-indigo-600 text-sm hover:underline">← Cursos</a></div> <h1 class="text-xl font-bold text-gray-900">Alumnos</h1> `);
		if (data.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">${escape_html(data.error)}</div>`);
		} else if (data.alumnos.length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-gray-500">No hay alumnos en este curso</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<input type="search"${attr("value", busqueda)} placeholder="Buscar alumno..." class="form-input"/> <div class="flex items-center justify-between"><p class="text-sm text-gray-500">${escape_html(alumnosFiltrados().length)} alumno/s</p> `);
			if (esPreceptorODir()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="flex gap-3 text-xs"><button class="text-indigo-600 hover:underline">Seleccionar todos</button> `);
				if (seleccionados.size > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button class="text-gray-400 hover:underline">Ninguno</button>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="space-y-2"><!--[-->`);
			const each_array = ensure_array_like(alumnosFiltrados());
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let alumno = each_array[$$index];
				$$renderer.push(`<div${attr_class(`card flex items-center gap-3 ${stringify(esPreceptorODir() && seleccionados.has(alumno.id) ? "border-indigo-400 bg-indigo-50" : "")}`)}>`);
				if (esPreceptorODir()) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button${attr_class(`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${stringify(seleccionados.has(alumno.id) ? "bg-indigo-600 border-indigo-600" : "border-gray-300 hover:border-indigo-400")}`)}${attr("aria-label", `Seleccionar ${stringify(alumno.fullname)}`)}>`);
					if (seleccionados.has(alumno.id)) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="text-white text-xs font-bold leading-none">✓</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></button>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0"><span class="text-indigo-600 font-semibold text-sm">${escape_html(alumno.firstname[0])}${escape_html(alumno.lastname[0])}</span></div> <div class="flex-1 min-w-0"><p class="font-medium text-gray-900 truncate">${escape_html(alumno.fullname)}</p> `);
				if (alumno.email) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-gray-400 truncate">${escape_html(alumno.email)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <div class="flex gap-2 flex-shrink-0"><a${attr("href", `/cursos/${stringify(data.cursoId)}/alumnos/${stringify(alumno.id)}/notas?nombre=${stringify(encodeURIComponent(alumno.fullname))}`)} class="text-sm text-indigo-600 hover:underline" title="Ver notas">📊</a> <a${attr("href", `/observaciones/nueva?cursoId=${stringify(data.cursoId)}&alumnoId=${stringify(alumno.id)}&alumnoNombre=${stringify(encodeURIComponent(alumno.fullname))}`)} class="text-sm text-indigo-600 hover:underline" title="Registrar observación">✏️</a></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (esPreceptorODir() && seleccionados.size > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="fixed bottom-16 sm:bottom-4 left-0 right-0 flex justify-center px-4 z-20 pointer-events-none"><div class="bg-gray-900 text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-sm w-full pointer-events-auto"><span class="text-sm font-semibold flex-1">${escape_html(seleccionados.size)} alumno${escape_html(seleccionados.size !== 1 ? "s" : "")} seleccionado${escape_html(seleccionados.size !== 1 ? "s" : "")}</span> <a${attr("href", urlBulk("faltas"))} class="bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap" title="Registrar falta">⏳ Falta</a> <a${attr("href", urlBulk("amonestaciones"))} class="bg-red-500 hover:bg-red-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap" title="Registrar amonestación">⚠️ Amonest.</a> <a${attr("href", urlBulk("reincorporaciones"))} class="bg-green-600 hover:bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap" title="Registrar reincorporación">↩️ Reinc.</a> <button class="text-gray-400 hover:text-white text-sm px-1 transition-colors" aria-label="Cerrar barra">✕</button></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BpRlUSYe.js.map
