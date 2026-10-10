import { h as head, b as attr, s as stringify, c as attr_class, e as escape_html, a as ensure_array_like, d as derived } from './dev-Dj5mSuMo.js';
import { a as CATEGORIA_POR_ID } from './categorias-BK8Z_nGh.js';
import { E as EncabezadoInforme } from './EncabezadoInforme-laulOR_S.js';
import './institucional-Ccb6xWsP.js';

//#region src/routes/gabinete/casos/[id]/informe/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let c = derived(() => data.caso);
		let familia = derived(() => data.para === "familia");
		let tipoNombre = derived(() => new Map(data.tipos.map((t) => [t.id, t.nombre])));
		let estadoNombre = derived(() => new Map(data.estados.map((e) => [e.id, e.nombre])));
		const fmt = (f) => {
			if (!f) return "—";
			return (typeof f === "string" && /^\d{4}-\d{2}-\d{2}$/.test(f) ? /* @__PURE__ */ new Date(f + "T12:00:00") : new Date(f)).toLocaleDateString("es-AR");
		};
		const NIVEL = {
			alerta: "Alerta",
			atencion: "Atención",
			ok: "Sin señales",
			sin_datos: "Sin datos"
		};
		let mensaje = "";
		let categoriasVisibles = derived(() => familia() ? data.categorias.filter((id) => !CATEGORIA_POR_ID.get(id)?.urgente) : data.categorias);
		let ocultasFamilia = derived(() => data.categorias.length - categoriasVisibles().length);
		let ultimosAcuerdos = derived(() => data.intervenciones.find((i) => i.acuerdos)?.acuerdos ?? null);
		head("aez53f", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Informe — ${escape_html(c().alumnoNombre)}</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex flex-wrap items-center gap-3 print:hidden"><a${attr("href", `/gabinete/casos/${stringify(c().id)}`)} class="text-indigo-600 text-sm hover:underline">← Caso</a> <div class="flex gap-1"><a href="?para=direccion"${attr_class(`text-xs px-3 py-1.5 rounded-full ${stringify(familia() ? "bg-gray-100 text-gray-700" : "bg-indigo-600 text-white")}`)}>Para dirección</a> <a href="?para=familia"${attr_class(`text-xs px-3 py-1.5 rounded-full ${stringify(familia() ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700")}`)}>Para la familia</a></div> <button class="btn-primary text-sm ml-auto">🖨️ Imprimir / Guardar PDF</button></div> `);
		if (familia()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 print:hidden">Versión para la familia: incluye solo las ${escape_html(data.compartidasTotal)} intervención(es) marcadas con 👪 en el caso.
      Releé el informe antes de entregarlo. `);
			if (ocultasFamilia() > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<strong>No se incluyen ${escape_html(ocultasFamilia())} categoría(s) de protocolo:</strong> esas situaciones se comunican por el circuito institucional.`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <article class="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 space-y-5 print:border-0 print:p-0">`);
		EncabezadoInforme($$renderer, {
			titulo: familia() ? "Informe de acompañamiento" : "Informe de seguimiento — Gabinete psicopedagógico",
			subtitulo: familia() ? "" : "Documento reservado"
		});
		$$renderer.push(`<!----> <table class="w-full text-sm"><tbody><tr><td class="py-0.5 text-gray-500 w-40">Alumno/a</td><td class="font-medium">${escape_html(c().alumnoNombre)}</td></tr><tr><td class="py-0.5 text-gray-500">Curso</td><td>${escape_html(c().cursoNombre ?? "—")}</td></tr><tr><td class="py-0.5 text-gray-500">Acompaña</td><td>Gabinete psicopedagógico${escape_html(data.responsable ? ` — ${data.responsable}` : "")}</td></tr><tr><td class="py-0.5 text-gray-500">Seguimiento desde</td><td>${escape_html(fmt(c().createdAt))}</td></tr>`);
		if (!familia()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<tr><td class="py-0.5 text-gray-500">Estado / nivel</td><td>${escape_html(estadoNombre().get(c().estado))} · nivel ${escape_html(c().nivel)} de apoyo</td></tr> <tr><td class="py-0.5 text-gray-500">Derivado por</td><td>${escape_html(c().derivadoPor)}</td></tr>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		if (c().estado !== "cerrado") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<tr><td class="py-0.5 text-gray-500">Próximo encuentro / revisión</td><td>${escape_html(fmt(c().proximaRevision))}</td></tr>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></tbody></table> <section class="space-y-1"><h2 class="text-sm font-bold text-gray-900">${escape_html(familia() ? "Aspectos en los que estamos acompañando" : "Motivo de intervención")}</h2> `);
		if (categoriasVisibles().length) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<ul class="text-sm text-gray-800 list-disc pl-5"><!--[-->`);
			const each_array = ensure_array_like(categoriasVisibles());
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let id = each_array[$$index];
				$$renderer.push(`<li>${escape_html(CATEGORIA_POR_ID.get(id)?.nombre)}</li>`);
			}
			$$renderer.push(`<!--]--></ul>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (!familia() && c().motivo) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm text-gray-800 whitespace-pre-line">${escape_html(c().motivo)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></section> `);
		if (c().fortalezas) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section class="space-y-1"><h2 class="text-sm font-bold text-gray-900">Fortalezas</h2> <p class="text-sm text-gray-800 whitespace-pre-line">${escape_html(c().fortalezas)}</p></section>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (!familia() && data.indicadores) {
			$$renderer.push("<!--[0-->");
			const ind = data.indicadores;
			$$renderer.push(`<section class="space-y-1 break-inside-avoid"><h2 class="text-sm font-bold text-gray-900">Indicadores actuales (alerta temprana)</h2> <table class="w-full text-sm"><tbody><!--[-->`);
			const each_array_1 = ensure_array_like([
				["Asistencia", ind.asistencia],
				["Conducta", ind.conducta],
				["Rendimiento", ind.rendimiento],
				["Vínculos", ind.vinculos]
			]);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let [area, i] = each_array_1[$$index_1];
				const x = i;
				$$renderer.push(`<tr class="border-b border-gray-100 align-top"><td class="py-1 text-gray-700 w-28">${escape_html(area)}</td><td class="py-1 w-24 font-medium">${escape_html(NIVEL[x.nivel])}</td><td class="py-1 text-gray-700">${escape_html(x.detalle)}</td></tr>`);
			}
			$$renderer.push(`<!--]--></tbody></table></section>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (!familia() && data.vinculos.length) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section class="space-y-1 break-inside-avoid"><h2 class="text-sm font-bold text-gray-900">Trabajo en grupo y vínculos</h2> <!--[-->`);
			const each_array_2 = ensure_array_like(data.vinculos);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let v = each_array_2[$$index_2];
				$$renderer.push(`<p class="text-sm text-gray-800">${escape_html(fmt(v.fecha))} · ${escape_html(v.nombreAgrupacion)}${escape_html(v.rol ? ` · rol: ${v.rol}` : "")} `);
				if (v.notaPedagogica.tipo === "acompanar") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`— ${escape_html(v.notaPedagogica.observaciones.join(" "))}`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></p>`);
			}
			$$renderer.push(`<!--]--></section>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <section class="space-y-2"><h2 class="text-sm font-bold text-gray-900">${escape_html(familia() ? "Lo que venimos haciendo" : "Intervenciones")}</h2> `);
		const each_array_3 = ensure_array_like(data.intervenciones);
		if (each_array_3.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let i = each_array_3[$$index_3];
				$$renderer.push(`<div class="border-l-2 border-gray-300 pl-3 break-inside-avoid"><p class="text-xs text-gray-500">${escape_html(fmt(i.fecha))} · ${escape_html(tipoNombre().get(i.tipo) ?? i.tipo)}${escape_html(familia() ? "" : ` · ${i.autor}`)}</p> <p class="text-sm text-gray-800 whitespace-pre-line">${escape_html(i.descripcion)}</p> `);
				if (i.acuerdos) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-sm text-gray-800 whitespace-pre-line"><strong>Acuerdos:</strong> ${escape_html(i.acuerdos)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<p class="text-sm text-gray-500">${escape_html(familia() ? "Todavía no hay registros compartidos con la familia." : "Sin intervenciones registradas.")}</p>`);
		}
		$$renderer.push(`<!--]--></section> `);
		if (familia()) {
			$$renderer.push("<!--[0-->");
			if (ultimosAcuerdos()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<section class="space-y-1"><h2 class="text-sm font-bold text-gray-900">Próximos pasos acordados</h2> <p class="text-sm text-gray-800 whitespace-pre-line">${escape_html(ultimosAcuerdos())}</p></section>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <section class="space-y-1 break-inside-avoid"><h2 class="text-sm font-bold text-gray-900">Mensaje del gabinete</h2> <textarea rows="4" class="form-input text-sm print:hidden" placeholder="Un mensaje cercano para la familia: cómo pueden acompañar desde casa, cómo contactarnos…">`);
			const $$body = escape_html(mensaje);
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea> <p class="hidden print:block text-sm text-gray-800 whitespace-pre-line min-h-12">${escape_html(mensaje)}</p></section>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="grid grid-cols-2 gap-10 pt-12 text-center text-xs text-gray-600"><div class="border-t border-gray-400 pt-1">Gabinete psicopedagógico<br/>${escape_html(data.emisor)}</div> <div class="border-t border-gray-400 pt-1">${escape_html(familia() ? "Familia (firma y aclaración)" : "Dirección")}</div></div> `);
		if (!familia()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-[10px] text-gray-400">Documento reservado: contiene información sensible de un/a menor (Ley 26.061; Ley 25.326 de protección de datos personales).
        No difundir.</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></article></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-QgoFZl_o.js.map
