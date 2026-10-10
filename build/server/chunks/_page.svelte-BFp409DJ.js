import { h as head, e as escape_html, c as attr_class, s as stringify, b as attr, a as ensure_array_like, i as attr_style, d as derived } from './dev-Dj5mSuMo.js';
import { a as CATEGORIA_POR_ID, A as AVISO_URGENTE } from './categorias-BK8Z_nGh.js';
import './client2-CwtFm9Hg.js';
import './internal-A6FQN3BT.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/gabinete/casos/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let c = derived(() => data.caso);
		[...data.categorias];
		let urgente = derived(() => data.categorias.some((id) => CATEGORIA_POR_ID.get(id)?.urgente));
		let tipoNombre = derived(() => new Map(data.tipos.map((t) => [t.id, t.nombre])));
		let estadoNombre = derived(() => new Map(data.estados.map((e) => [e.id, e.nombre])));
		let guia = derived(() => data.guia[c().nivel]);
		const fmt = (f) => f ? (/* @__PURE__ */ new Date(f + "T12:00:00")).toLocaleDateString("es-AR") : "—";
		const NIVEL_CLS = {
			3: "bg-red-600 text-white",
			2: "bg-amber-500 text-white",
			1: "bg-green-600 text-white"
		};
		const ORIGEN = {
			derivacion: "Derivación",
			alerta: "Alerta temprana",
			gabinete: "Abierto por el gabinete"
		};
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			head("10dez4c", $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>${escape_html(c().alumnoNombre)} — Caso</title>`);
				});
			});
			$$renderer.push(`<div class="space-y-4"><a href="/gabinete/casos" class="text-indigo-600 text-sm hover:underline">← Casos</a> `);
			if (form?.error) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (form?.ok) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">${escape_html(form.ok)}</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="card space-y-2"><div class="flex items-start justify-between gap-2"><div class="min-w-0"><p class="text-lg font-bold text-gray-900"><span${attr_class(`text-xs font-bold px-2 py-0.5 rounded-full align-middle ${stringify(NIVEL_CLS[c().nivel])}`)}>N${escape_html(c().nivel)}</span> <a${attr("href", `/gabinete/alumno/${stringify(c().alumnoMoodleId)}`)} class="hover:text-indigo-700">${escape_html(c().alumnoNombre)}</a></p> <p class="text-xs text-gray-500">${escape_html(c().cursoNombre ?? "sin curso")} · ${escape_html(ORIGEN[c().origen] ?? c().origen)} por ${escape_html(data.derivadoPorNombre)}
          · ${escape_html(new Date(c().createdAt).toLocaleDateString("es-AR"))}</p></div> <span class="text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 flex-shrink-0">${escape_html(estadoNombre().get(c().estado))}</span></div> `);
			if (c().estado !== "cerrado") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p${attr_class(`text-xs ${stringify(c().proximaRevision && c().proximaRevision < data.hoy ? "text-red-600 font-medium" : "text-gray-500")}`)}>Próxima revisión: ${escape_html(fmt(c().proximaRevision))}</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (data.categorias.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="flex flex-wrap gap-1.5"><!--[-->`);
				const each_array = ensure_array_like(data.categorias);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let id = each_array[$$index];
					const cat = CATEGORIA_POR_ID.get(id);
					if (cat) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="text-xs px-2 py-0.5 rounded-full text-white"${attr_style(`background:${stringify(cat.color)}`)}>${escape_html(cat.urgente ? "⚠️ " : "")}${escape_html(cat.nombre)}</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]-->`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (urgente() && c().estado !== "cerrado") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-xs bg-red-50 border border-red-300 text-red-800 rounded-lg px-3 py-2">⚠️ ${escape_html(AVISO_URGENTE)}</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="flex flex-wrap gap-3 text-xs print:hidden"><a${attr("href", `/gabinete/casos/${stringify(c().id)}/informe?para=direccion`)} class="text-indigo-700 hover:underline">📄 Informe para dirección</a> <a${attr("href", `/gabinete/casos/${stringify(c().id)}/informe?para=familia`)} class="text-indigo-700 hover:underline">👪 Informe para la familia</a></div> `);
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div><p class="text-xs font-medium text-gray-700">Motivo</p> <p class="text-sm text-gray-800 whitespace-pre-line">${escape_html(c().motivo)}</p></div> `);
			if (c().fortalezas) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div><p class="text-xs font-medium text-gray-700">Fortalezas</p> <p class="text-sm text-gray-800 whitespace-pre-line">${escape_html(c().fortalezas)}</p></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <button class="text-xs text-indigo-600 hover:underline">✏️ Editar caso</button>`);
			$$renderer.push(`<!--]--></div> `);
			if (c().estado !== "cerrado" && guia()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<details class="card"${attr("open", c().estado === "derivado" || c().estado === "evaluacion", true)}><summary class="text-sm font-semibold text-gray-800 cursor-pointer">📚 ${escape_html(guia().titulo)}</summary> <div class="mt-2 space-y-2"><!--[-->`);
				const each_array_4 = ensure_array_like(guia().sugerencias);
				for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
					let s = each_array_4[$$index_4];
					$$renderer.push(`<div class="border-l-2 border-indigo-300 pl-3"><p class="text-sm text-gray-700">${escape_html(s.texto)}</p> <p class="text-xs text-gray-400">${escape_html(s.fundamento)}</p></div>`);
				}
				$$renderer.push(`<!--]--></div></details>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (c().estado !== "cerrado") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<form method="POST" action="?/intervencion" class="card space-y-2"><p class="text-sm font-semibold text-gray-800">+ Registrar intervención</p> <div class="grid sm:grid-cols-2 gap-2"><div><label class="form-label" for="tipo">Tipo</label> <select id="tipo" name="tipo" class="form-input text-sm"><!--[-->`);
				const each_array_5 = ensure_array_like(data.tipos.filter((t) => t.id !== "derivacion"));
				for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
					let t = each_array_5[$$index_5];
					$$renderer.option({ value: t.id }, ($$renderer) => {
						$$renderer.push(`${escape_html(t.nombre)}`);
					});
				}
				$$renderer.push(`<!--]--></select></div> <div><label class="form-label" for="fecha">Fecha</label> <input id="fecha" name="fecha" type="date"${attr("value", data.hoy)} class="form-input text-sm" required=""/></div></div> <div><label class="form-label" for="desc">Qué se hizo / qué se observó</label> <textarea id="desc" name="descripcion" rows="3" maxlength="5000" class="form-input text-sm" required=""></textarea></div> <div><label class="form-label" for="acu">Acuerdos y próximos pasos <span class="text-gray-400 font-normal">(opcional)</span></label> <textarea id="acu" name="acuerdos" rows="2" maxlength="3000" class="form-input text-sm"></textarea></div> <label class="flex items-start gap-2 text-sm text-gray-700"><input type="checkbox" name="visibleFamilia" value="1" class="mt-0.5"/> <span>👪 Incluir en el informe para la familia <span class="block text-xs text-gray-500">Revisá que no mencione a otros alumnos ni datos internos.</span></span></label> <div class="flex items-end gap-2"><div class="flex-1"><label class="form-label" for="prox">Próxima revisión <span class="text-gray-400 font-normal">(vacío = según nivel)</span></label> <input id="prox" name="proximaRevision" type="date" class="form-input text-sm"/></div> <button type="submit" class="btn-primary text-sm">Guardar registro</button></div></form>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">Historial (${escape_html(data.intervenciones.length)})</p> `);
			const each_array_6 = ensure_array_like(data.intervenciones);
			if (each_array_6.length !== 0) {
				$$renderer.push("<!--[-->");
				for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
					let r = each_array_6[$$index_6];
					$$renderer.push(`<div class="border-l-2 border-gray-200 pl-3 py-1 space-y-0.5"><p class="text-xs text-gray-500">${escape_html(fmt(r.i.fecha))} · <strong class="text-gray-700">${escape_html(tipoNombre().get(r.i.tipo) ?? r.i.tipo)}</strong> · ${escape_html(r.autor)} `);
					if (r.i.visibleFamilia) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="ml-1 px-1.5 rounded bg-teal-50 text-teal-700">👪 compartido</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></p> <p class="text-sm text-gray-800 whitespace-pre-line">${escape_html(r.i.descripcion)}</p> `);
					if (r.i.acuerdos) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<p class="text-xs text-indigo-800 bg-indigo-50 rounded px-2 py-1 whitespace-pre-line">Acuerdos: ${escape_html(r.i.acuerdos)}</p>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				}
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push(`<p class="text-sm text-gray-500">Todavía no hay registros.</p>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BFp409DJ.js.map
