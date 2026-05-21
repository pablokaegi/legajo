import { h as head, b as attr, s as stringify, e as escape_html, a as ensure_array_like, c as attr_class, d as derived } from './dev-BsmPEhme.js';

//#region src/routes/institucional/agrupamientos/[id]/resultados/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let sesion = derived(() => data.sesion);
		let seccion = "afinidad";
		function iniciales(nombre) {
			return nombre.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
		}
		head("8qmue2", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Resultados — ${escape_html(sesion().titulo)}</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-2"><a${attr("href", `/institucional/agrupamientos/${stringify(sesion().id)}`)} class="text-indigo-600 text-sm hover:underline">← Volver</a> <h2 class="text-lg font-bold text-gray-900">Resultados</h2></div> <div class="card"><p class="text-sm font-semibold text-gray-800">${escape_html(sesion().titulo)}</p> <p class="text-xs text-gray-500">🎓 ${escape_html(sesion().cursoNombre)} · 📅 ${escape_html(sesion().fecha)} · 🗳️ ${escape_html(data.totalVotos)} votos</p></div> `);
		if (data.totalVotos < 2) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-3xl mb-2">📭</p> <p class="text-gray-500 text-sm">Necesitás al menos 2 votos cargados para generar resultados.</p> <a${attr("href", `/institucional/agrupamientos/${stringify(sesion().id)}`)} class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Cargar votos</a></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="bg-white border border-gray-200 rounded-xl overflow-x-auto"><nav class="flex min-w-max"><!--[-->`);
			const each_array = ensure_array_like([
				["afinidad", "🤝 Por afinidad"],
				["equilibrados", "⚖️ Equilibrados"],
				["analisis", "🧠 Análisis"]
			]);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let [val, lbl] = each_array[$$index];
				$$renderer.push(`<button${attr_class(`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${stringify(seccion === val ? "border-indigo-600 text-indigo-700 bg-indigo-50" : "border-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-50")}`)}>${escape_html(lbl)}</button>`);
			}
			$$renderer.push(`<!--]--></nav></div> `);
			{
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-xs text-gray-500">Grupos formados priorizando las afinidades mutuas y evitando bloqueos.
        El número indica el promedio de afinidad interna.</p> `);
				if (data.emparejamientos.length === 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="card text-center py-8"><p class="text-gray-500 text-sm">No se pudieron formar grupos.</p></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<div class="grid gap-2 sm:grid-cols-2"><!--[-->`);
					const each_array_1 = ensure_array_like(data.emparejamientos);
					for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
						let grupo = each_array_1[i];
						$$renderer.push(`<div class="card space-y-2"><div class="flex items-center justify-between"><p class="text-sm font-semibold text-gray-800">Grupo ${escape_html(i + 1)}</p> <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">afinidad ${escape_html(grupo.afinidadPromedio)}</span></div> <div class="space-y-1"><!--[-->`);
						const each_array_2 = ensure_array_like(grupo.miembros);
						for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
							let m = each_array_2[$$index_1];
							$$renderer.push(`<div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">${escape_html(iniciales(m.nombre))}</div> <span class="text-sm text-gray-800">${escape_html(m.nombre)}</span></div>`);
						}
						$$renderer.push(`<!--]--></div></div>`);
					}
					$$renderer.push(`<!--]--></div>`);
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DqE3VQBn.js.map
