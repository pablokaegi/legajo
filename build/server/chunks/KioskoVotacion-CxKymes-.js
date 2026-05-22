import { b as attr, e as escape_html, i as attr_style, s as stringify, a as ensure_array_like, c as attr_class, d as derived } from './dev-BsmPEhme.js';
import './client2-pAhl18Gk.js';
import { I as INSTITUCION } from './institucional-Ccb6xWsP.js';

//#region src/lib/components/KioskoVotacion.svelte
function KioskoVotacion($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { titulo, cursoNombre, roster, yaVotaron, asignaciones, cerrada, action, form } = $$props;
		let busqueda = "";
		let votaronSet = derived(() => new Set(yaVotaron));
		let pendientes = derived(() => roster.filter((a) => !votaronSet().has(a.id)));
		let listaFiltrada = derived(() => (roster));
		function iniciales(n) {
			return n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
		}
		$$renderer.push(`<div class="w-full max-w-lg mx-auto space-y-4"><div class="bg-indigo-700 text-white rounded-xl px-5 py-4 flex items-center gap-3"><img${attr("src", INSTITUCION.logo)} alt="" class="h-10 w-10 object-contain bg-white rounded-lg p-1 flex-shrink-0" onerror="this.__e=event"/> <div class="min-w-0"><p class="font-bold text-sm truncate">${escape_html(titulo)}</p> <p class="text-xs text-indigo-200 truncate">🎓 ${escape_html(cursoNombre)}</p></div></div> `);
		if (cerrada) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm text-center">🔒 La votación está cerrada.</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-white rounded-xl border border-gray-200 p-4 space-y-3"><div><p class="text-sm font-semibold text-gray-800">¿Quién está votando?</p> <p class="text-xs text-gray-500">Tocá tu nombre. Votaron ${escape_html(yaVotaron.length)} de ${escape_html(roster.length)}.</p></div> <div class="h-2 bg-gray-100 rounded-full overflow-hidden"><div class="h-full bg-indigo-600 transition-all"${attr_style(`width: ${stringify(roster.length ? yaVotaron.length / roster.length * 100 : 0)}%`)}></div></div> <input type="search"${attr("value", busqueda)} placeholder="Buscar tu nombre..." class="form-input text-sm w-full"/> <div class="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1"><!--[-->`);
			const each_array = ensure_array_like(listaFiltrada());
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let alumno = each_array[$$index];
				const voto = votaronSet().has(alumno.id);
				$$renderer.push(`<button${attr("disabled", voto || cerrada, true)}${attr_class(`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-colors ${stringify(voto ? "bg-green-50 border-green-200 cursor-default" : "bg-white border-gray-200 hover:border-indigo-300 active:bg-indigo-50")}`)}><div${attr_class(`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${stringify(voto ? "bg-green-200 text-green-800" : "bg-indigo-100 text-indigo-700")}`)}>${escape_html(iniciales(alumno.nombre))}</div> <span class="flex-1 text-sm font-medium text-gray-900">${escape_html(alumno.nombre)}</span> `);
				if (voto) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="text-xs text-green-600 font-medium">✓ Votó</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></button>`);
			}
			$$renderer.push(`<!--]--></div> `);
			if (pendientes().length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center text-sm text-green-700">🎉 ¡Todos los alumnos votaron!</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { KioskoVotacion as K };
//# sourceMappingURL=KioskoVotacion-CxKymes-.js.map
