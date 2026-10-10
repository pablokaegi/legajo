import { h as head, e as escape_html, a as ensure_array_like, c as attr_class, i as attr_style, s as stringify, b as attr, d as derived } from './dev-BsmPEhme.js';
import './client2-Ds2pOMTK.js';
import './internal-Bh7K86Ic.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/aula/[cursoId]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const copia = () => (data.actual?.bancos ?? []).map((b) => [...b]);
		let bancos = copia();
		let columnas = data.actual?.columnas ?? 3;
		let editando = data.esPropuesta;
		let nombre = data.actual?.nombre ?? "";
		let cambios = data.esPropuesta;
		let ubicados = derived(() => new Set(bancos.flat().filter((s) => s != null).map((s) => s.id)));
		let sinUbicar = derived(() => data.roster.filter((a) => !ubicados().has(a.id)));
		const ORIGEN = {
			inclusiva: "Ubicación inclusiva",
			aleatorio: "Al azar",
			alfabetico: "Alfabético",
			manual: "Manual"
		};
		const fecha = (d) => d ? new Date(d).toLocaleDateString("es-AR") : "";
		head("19torhk", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Aula — ${escape_html(data.cursoNombre)}</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="print:hidden"><h1 class="text-lg font-bold text-gray-900">🪑 Plano del aula</h1> <p class="text-xs text-gray-500">🎓 ${escape_html(data.cursoNombre)}</p></div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 print:hidden">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.ok) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2 print:hidden">${escape_html(form.ok)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="card space-y-2 print:hidden"><p class="text-sm font-semibold text-gray-800">Armar una propuesta</p> <div class="flex flex-wrap gap-2"><button class="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white">✨ Inclusiva (según la votación)</button> <button class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-indigo-100">🎲 Al azar</button> <button class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-indigo-100">🔤 Alfabético</button></div> <p class="text-[11px] text-gray-400">La inclusiva sienta a quien conviene acompañar junto a un compañero bien aceptado que no lo rechaza
      (van den Berg &amp; Stoltz, 2018). Después podés ajustar a mano.</p></div> `);
		if (!data.actual) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-10 text-sm text-gray-500">Este curso todavía no tiene un plano. Armá una propuesta arriba.</div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			if (data.esPropuesta) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2 print:hidden">Propuesta <strong>sin guardar</strong> (${escape_html(ORIGEN[data.actual.origen])}). ${escape_html(data.actual.nota ?? "")}</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="flex flex-wrap items-center gap-3 print:hidden"><div class="flex items-center gap-1.5"><span class="text-xs text-gray-500">Columnas:</span> <!--[-->`);
			const each_array = ensure_array_like([
				2,
				3,
				4
			]);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let n = each_array[$$index];
				$$renderer.push(`<button${attr_class(`w-7 h-7 rounded-lg text-xs font-semibold ${stringify(columnas === n ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600")}`)}>${escape_html(n)}</button>`);
			}
			$$renderer.push(`<!--]--></div> `);
			if (editando) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button class="text-xs text-indigo-600 hover:underline">+ Banco</button> <button class="text-xs text-gray-500 hover:underline">Quitar bancos vacíos</button>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<button class="text-xs text-indigo-600 hover:underline">✏️ Editar</button>`);
			}
			$$renderer.push(`<!--]--> <button class="text-xs text-gray-600 hover:underline ml-auto">🖨️ Imprimir</button></div> `);
			if (editando) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-xs text-indigo-700 print:hidden">Tocá un asiento y después otro para intercambiarlos. Para ubicar a alguien de "sin ubicar", tocalo y después tocá el asiento.</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="card space-y-3 print:shadow-none print:border-0"><p class="hidden print:block text-base font-bold">Plano del aula — ${escape_html(data.cursoNombre)}</p> <div class="bg-gray-700 text-white text-xs text-center rounded py-1.5">🧑‍🏫 Pizarrón / frente del aula</div> <div class="grid gap-x-8 gap-y-3"${attr_style(`grid-template-columns: repeat(${stringify(columnas)}, minmax(0, 1fr));`)}><!--[-->`);
			const each_array_1 = ensure_array_like(bancos);
			for (let b = 0, $$length = each_array_1.length; b < $$length; b++) {
				let banco = each_array_1[b];
				$$renderer.push(`<div class="rounded-lg border border-amber-300 bg-amber-50/60 p-1.5 space-y-1"><p class="text-[10px] text-amber-800 font-medium">Banco ${escape_html(b + 1)}</p> <div class="grid gap-1"${attr_style(`grid-template-columns: repeat(${stringify(banco.length)}, minmax(0, 1fr));`)}><!--[-->`);
				const each_array_2 = ensure_array_like(banco);
				for (let a = 0, $$length = each_array_2.length; a < $$length; a++) {
					let asiento = each_array_2[a];
					$$renderer.push(`<div class="relative"><button type="button"${attr_class(`w-full text-left rounded px-1.5 py-1 pr-3 text-[11px] leading-tight min-h-[2.25rem] border transition-colors ${stringify(asiento ? "border-white bg-white" : "border-dashed border-gray-300 bg-transparent text-gray-400")} ${stringify(editando ? "cursor-pointer" : "cursor-default")}`)}>${escape_html(asiento ? asiento.nombre : "libre")}</button> `);
					if (editando && asiento) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<button type="button" aria-label="Quitar del banco" class="absolute top-0 right-0.5 text-xs text-gray-300 hover:text-red-500 print:hidden">×</button>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				}
				$$renderer.push(`<!--]--></div></div>`);
			}
			$$renderer.push(`<!--]--></div></div> `);
			if (sinUbicar().length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="card space-y-2 print:hidden"><p class="text-sm font-semibold text-gray-800">Sin ubicar (${escape_html(sinUbicar().length)})</p> <div class="flex flex-wrap gap-1.5"><!--[-->`);
				const each_array_3 = ensure_array_like(sinUbicar());
				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let a = each_array_3[$$index_3];
					$$renderer.push(`<button${attr_class(`text-xs px-2.5 py-1.5 rounded-lg ${stringify("bg-gray-100 text-gray-700")}`)}>${escape_html(a.nombre)}</button>`);
				}
				$$renderer.push(`<!--]--></div></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (cambios) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<form method="POST" action="?/guardar" class="card flex flex-wrap items-end gap-2 print:hidden"><div class="flex-1 min-w-48"><label class="form-label" for="nom">Nombre del plano</label> <input id="nom" name="nombre"${attr("value", nombre)} maxlength="200" class="form-input text-sm" placeholder="Ej.: Plano 2.º trimestre"/></div> <input type="hidden" name="columnas"${attr("value", columnas)}/> <input type="hidden" name="origen"${attr("value", data.actual.id == null ? data.actual.origen : "manual")}/> <input type="hidden" name="sesionId"${attr("value", data.actual.sesionId ?? "")}/> <input type="hidden" name="bancosJson"${attr("value", JSON.stringify(bancos))}/> <button type="submit" class="btn-primary text-sm">💾 Guardar como vigente</button></form>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--> `);
		if (data.planos.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card space-y-1.5 print:hidden"><p class="text-sm font-semibold text-gray-800">Historial de planos</p> <!--[-->`);
			const each_array_4 = ensure_array_like(data.planos);
			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let p = each_array_4[$$index_4];
				$$renderer.push(`<div class="flex items-center gap-2 text-sm"><a${attr("href", `?plano=${stringify(p.id)}`)} class="flex-1 truncate text-gray-800 hover:text-indigo-700">${escape_html(p.vigente ? "⭐ " : "")}${escape_html(p.nombre)} <span class="text-xs text-gray-400">· ${escape_html(ORIGEN[p.origen] ?? p.origen)} · ${escape_html(fecha(p.createdAt))}</span></a> `);
				if (!p.vigente) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<form method="POST" action="?/vigente"><input type="hidden" name="planoId"${attr("value", p.id)}/> <button class="text-xs text-indigo-600 hover:underline">Usar</button></form>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (p.puedeBorrar) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<form method="POST" action="?/eliminar"><input type="hidden" name="planoId"${attr("value", p.id)}/> <button class="text-xs text-gray-400 hover:text-red-500">✕</button></form>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-QG_iqUZ_.js.map
