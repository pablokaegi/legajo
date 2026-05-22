import { h as head, b as attr, s as stringify, e as escape_html, a as ensure_array_like, c as attr_class, d as derived } from './dev-BsmPEhme.js';
import './client2-CNP-W7uK.js';
import './internal-Cvs6sX88.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/institucional/agrupamientos/[id]/resultados/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let sesion = derived(() => data.sesion);
		let modo = "afinidad";
		let gruposActuales = derived(() => {
			return data.afinidad.map((g) => g.miembros);
		});
		function iniciales(n) {
			return n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
		}
		const MODOS = [
			{
				id: "afinidad",
				lbl: "🤝 Afinidad",
				desc: "Junta a los que se eligieron entre sí y evita los bloqueos."
			},
			{
				id: "heterogeneo",
				lbl: "⚖️ Heterogéneo",
				desc: "Mezcla parejo: populares y menos elegidos repartidos en cada grupo."
			},
			{
				id: "rendimiento",
				lbl: "📚 Rendimiento",
				desc: "Usa las notas de Moodle: arma grupos mixtos con distintos niveles académicos."
			},
			{
				id: "aleatorio",
				lbl: "🎲 Aleatorio",
				desc: "Grupos al azar, sin tener en cuenta la votación."
			},
			{
				id: "manual",
				lbl: "✋ Manual",
				desc: "Armás los grupos vos: elegí un grupo y tocá a los alumnos para asignarlos."
			}
		];
		head("8qmue2", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Grupos — ${escape_html(sesion().titulo)}</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-2"><a${attr("href", `/institucional/agrupamientos/${stringify(sesion().id)}`)} class="text-indigo-600 text-sm hover:underline">← Panel</a> <h2 class="text-lg font-bold text-gray-900">Armar grupos</h2></div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.ok) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">Guardado.</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="card"><p class="text-sm font-semibold text-gray-800">${escape_html(sesion().titulo)}</p> <p class="text-xs text-gray-500">🎓 ${escape_html(sesion().cursoNombre)} · 🗳️ ${escape_html(data.totalVotos)} votos</p></div> <div class="bg-white border border-gray-200 rounded-xl overflow-x-auto"><nav class="flex min-w-max"><!--[-->`);
		const each_array = ensure_array_like(MODOS);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let m = each_array[$$index];
			$$renderer.push(`<button${attr_class(`px-3 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${stringify(modo === m.id ? "border-indigo-600 text-indigo-700 bg-indigo-50" : "border-transparent text-gray-600 hover:bg-gray-50")}`)}>${escape_html(m.lbl)}</button>`);
		}
		$$renderer.push(`<!--]--></nav></div> <p class="text-xs text-gray-500">${escape_html(MODOS.find((m) => m.id === modo)?.desc)}</p> <div class="flex items-center gap-3 flex-wrap">`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (gruposActuales().length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="text-xs text-indigo-600 hover:underline ml-auto">💾 Guardar esta agrupación</button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (gruposActuales().length === 0) {
			$$renderer.push("<!--[0-->");
			{
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="card text-center py-8"><p class="text-gray-500 text-sm">No hay grupos para mostrar.</p></div>`);
			}
			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="grid gap-2 sm:grid-cols-2"><!--[-->`);
			const each_array_3 = ensure_array_like(gruposActuales());
			for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
				let grupo = each_array_3[i];
				$$renderer.push(`<div${attr_class(`card space-y-2 ${stringify("")}`)}><div class="flex items-center justify-between"><button${attr_class(`text-sm font-semibold text-gray-800 ${stringify("cursor-default")}`)}>Grupo ${escape_html(i + 1)}</button> `);
				if (data.afinidad[i]) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">afinidad ${escape_html(data.afinidad[i].afinidadPromedio)}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <div class="space-y-1"><!--[-->`);
				const each_array_4 = ensure_array_like(grupo);
				for (let j = 0, $$length = each_array_4.length; j < $$length; j++) {
					let m = each_array_4[j];
					$$renderer.push(`<div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">${escape_html(iniciales(m.nombre))}</div> <div class="flex-1 min-w-0"><p class="text-sm text-gray-800 truncate">${escape_html(m.nombre)}</p> `);
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div> `);
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				}
				$$renderer.push(`<!--]--> `);
				if (grupo.length === 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-gray-400 italic">Vacío</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--> `);
		if (data.guardados.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">Agrupaciones guardadas</p> <!--[-->`);
			const each_array_5 = ensure_array_like(data.guardados);
			for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
				let g = each_array_5[$$index_5];
				$$renderer.push(`<div class="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-gray-50"><span class="flex-1 text-sm text-gray-800">${escape_html(g.nombre)}<span class="text-xs text-gray-400">· ${escape_html(g.modo)} · ${escape_html(g.grupos.length)} grupos</span></span> <form method="POST" action="?/eliminar"><input type="hidden" name="grupoId"${attr("value", g.id)}/> <button type="submit" class="text-xs text-gray-400 hover:text-red-500">✕</button></form></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Dyoj4g5X.js.map
