import { h as head, b as attr, a as ensure_array_like, c as attr_class, e as escape_html, s as stringify, d as derived } from './dev-BsmPEhme.js';

//#region src/routes/institucional/agrupamientos/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const ESTADO_COLOR = {
			abierta: "bg-blue-100 text-blue-700",
			cerrada: "bg-green-100 text-green-700"
		};
		let busqueda = "";
		let filtroEstado = data.estado ?? "";
		let listaFiltrada = derived(() => data.lista.filter((s) => {
			const q = busqueda.trim().toLowerCase();
			const matchTexto = !q || (s.titulo ?? "").toLowerCase().includes(q) || (s.cursoNombre ?? "").toLowerCase().includes(q);
			const matchEstado = !filtroEstado || s.estado === filtroEstado;
			return matchTexto && matchEstado;
		}));
		head("1k7tanz", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Agrupamientos — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center justify-between"><h2 class="text-lg font-bold text-gray-900">Agrupamientos</h2> <a href="/institucional/agrupamientos/nueva" class="btn-primary text-sm">+ Nueva</a></div> <p class="text-xs text-gray-500">Sociograma del curso: cargá las preferencias de los alumnos y generá grupos por
    afinidad junto con un análisis psicopedagógico de la dinámica social.</p> <div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span> <input type="text"${attr("value", busqueda)} placeholder="Buscar por título o curso..." class="form-input pl-9 w-full text-sm"/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="flex gap-2 overflow-x-auto pb-1"><!--[-->`);
		const each_array = ensure_array_like([
			["", "Todas"],
			["abierta", "Abiertas"],
			["cerrada", "Cerradas"]
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [val, lbl] = each_array[$$index];
			$$renderer.push(`<button${attr_class(`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${stringify(filtroEstado === val ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 text-gray-600 hover:border-indigo-300")}`)}>${escape_html(lbl)}</button>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (data.lista.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-3xl mb-2">🧩</p> <p class="text-gray-500 text-sm">No hay sesiones de agrupamiento registradas.</p> <a href="/institucional/agrupamientos/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Crear la primera</a></div>`);
		} else if (listaFiltrada().length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="card text-center py-8"><p class="text-2xl mb-2">🔍</p> <p class="text-gray-500 text-sm">No hay sesiones que coincidan.</p> <button class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-2"><!--[-->`);
			const each_array_1 = ensure_array_like(listaFiltrada());
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let s = each_array_1[$$index_1];
				$$renderer.push(`<a${attr("href", `/institucional/agrupamientos/${stringify(s.id)}`)} class="card block hover:border-indigo-300 transition-colors space-y-1"><div class="flex items-start justify-between gap-2"><div class="flex-1 min-w-0"><p class="text-sm font-semibold text-gray-800">${escape_html(s.titulo)}</p> <p class="text-xs text-gray-500">🎓 ${escape_html(s.cursoNombre)}</p></div> <span${attr_class(`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${stringify(ESTADO_COLOR[s.estado] ?? "bg-gray-100 text-gray-600")}`)}>${escape_html(s.estado)}</span></div> <p class="text-xs text-gray-500">📅 ${escape_html(s.fecha)} · 🗳️ ${escape_html(s.cantidadVotos)} voto/s cargado/s</p></a>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-AWohwjHz.js.map
