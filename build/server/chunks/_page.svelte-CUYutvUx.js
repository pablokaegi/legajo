import { h as head, e as escape_html, c as attr_class, s as stringify, a as ensure_array_like, b as attr, d as derived } from './dev-Dj5mSuMo.js';

//#region src/routes/gabinete/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let filtroCurso = "";
		let cursos = derived(() => (data.cursos));
		const fmt = (f) => f ? (/* @__PURE__ */ new Date(f + "T12:00:00")).toLocaleDateString("es-AR") : "—";
		head("1rqcogw", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Gabinete — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="grid grid-cols-2 sm:grid-cols-4 gap-2"><a href="/gabinete/casos?estado=abiertos" class="card text-center hover:border-indigo-300"><p class="text-2xl font-bold text-indigo-700">${escape_html(data.resumen.abiertos)}</p> <p class="text-xs text-gray-500">Casos abiertos</p></a> <a href="/gabinete/casos?estado=derivado" class="card text-center hover:border-indigo-300"><p${attr_class(`text-2xl font-bold ${stringify(data.resumen.conteo.derivado ? "text-amber-600" : "text-gray-400")}`)}>${escape_html(data.resumen.conteo.derivado ?? 0)}</p> <p class="text-xs text-gray-500">Derivaciones sin evaluar</p></a> <div class="card text-center"><p${attr_class(`text-2xl font-bold ${stringify(data.resumen.vencidas.length ? "text-red-600" : "text-gray-400")}`)}>${escape_html(data.resumen.vencidas.length)}</p> <p class="text-xs text-gray-500">Revisiones vencidas</p></div> <a href="/gabinete/casos?estado=abiertos&amp;nivel=3" class="card text-center hover:border-indigo-300"><p${attr_class(`text-2xl font-bold ${stringify(data.resumen.nivel3 ? "text-red-600" : "text-gray-400")}`)}>${escape_html(data.resumen.nivel3)}</p> <p class="text-xs text-gray-500">En nivel 3 (intensivo)</p></a></div> `);
		if (data.derivados.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">📨 Derivaciones para evaluar</p> <!--[-->`);
			const each_array = ensure_array_like(data.derivados);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let c = each_array[$$index];
				$$renderer.push(`<a${attr("href", `/gabinete/casos/${stringify(c.id)}`)} class="block rounded-lg border border-gray-200 p-2 hover:border-indigo-300"><p class="text-sm font-medium text-gray-900">${escape_html(c.alumnoNombre)} <span class="text-xs text-gray-400">· ${escape_html(c.cursoNombre ?? "sin curso")}</span></p> <p class="text-xs text-gray-600 line-clamp-2 whitespace-pre-line">${escape_html(c.motivo)}</p></a>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (data.resumen.vencidas.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">⏰ Revisiones vencidas</p> <p class="text-xs text-gray-500">Monitorear el progreso con regularidad y ajustar el plan si no hay avance es lo que hace que un
        apoyo funcione. — Fuchs &amp; Fuchs (2006).</p> <!--[-->`);
			const each_array_1 = ensure_array_like(data.resumen.vencidas);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let c = each_array_1[$$index_1];
				$$renderer.push(`<a${attr("href", `/gabinete/casos/${stringify(c.id)}`)} class="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/40 p-2 hover:border-red-300"><span class="text-sm text-gray-900">${escape_html(c.alumnoNombre)} <span class="text-xs text-gray-400">· nivel ${escape_html(c.nivel)}</span></span> <span class="text-xs text-red-700">revisar desde ${escape_html(fmt(c.proximaRevision))}</span></a>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">🚦 Alerta temprana por curso</p> <p class="text-xs text-gray-500">Cruza asistencia, conducta, rendimiento y vínculos de cada alumno para detectar a tiempo a quién conviene
      acompañar. — Balfanz, Herzog &amp; Mac Iver (2007); Allensworth &amp; Easton (2007).</p> <input type="search"${attr("value", filtroCurso)} placeholder="Buscar curso…" class="form-input text-sm"/> <div class="grid sm:grid-cols-2 gap-1.5 max-h-80 overflow-y-auto">`);
		const each_array_2 = ensure_array_like(cursos());
		if (each_array_2.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let c = each_array_2[$$index_2];
				$$renderer.push(`<a${attr("href", `/gabinete/curso/${stringify(c.id)}`)} class="text-sm px-3 py-2 rounded-lg bg-gray-50 hover:bg-indigo-50 text-gray-800 truncate">${escape_html(c.nombre)}</a>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<p class="text-sm text-gray-500">No se pudieron cargar los cursos de Moodle.</p>`);
		}
		$$renderer.push(`<!--]--></div></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CUYutvUx.js.map
