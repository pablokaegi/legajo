import { h as head, b as attr, s as stringify, e as escape_html, a as ensure_array_like, c as attr_class } from './dev-BsmPEhme.js';
import { I as INSTITUCION } from './institucional-Ccb6xWsP.js';

//#region src/routes/institucional/salidas/[id]/archivo/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		function ext(path) {
			return path.split(".").pop()?.toLowerCase() ?? "";
		}
		function esImagen(p) {
			return [
				"jpg",
				"jpeg",
				"png",
				"webp",
				"gif"
			].includes(ext(p));
		}
		function esPdf(p) {
			return ext(p) === "pdf";
		}
		head("1nej71k", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Archivo de autorizaciones — ${escape_html(data.salida.titulo)}</title>`);
			});
			$$renderer.push(`<style>
    @media print {
      .no-print { display: none !important; }
      .pagina-rotura { page-break-after: always; }
      body { background: white !important; }
    }
  </style>`);
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex items-center justify-between gap-2 no-print"><a${attr("href", `/institucional/salidas/${stringify(data.salida.id)}`)} class="text-indigo-600 text-sm hover:underline">← Volver a la salida</a> <button class="btn-primary text-sm">🖨 Imprimir / Guardar PDF</button></div> <div class="card bg-indigo-50 border-indigo-200 space-y-1"><div class="flex items-center gap-3"><img${attr("src", INSTITUCION.logo)} alt="" class="h-12 w-12 object-contain bg-white rounded-lg p-1 flex-shrink-0" onerror="this.__e=event"/> <div><p class="text-sm font-bold text-indigo-800">${escape_html(INSTITUCION.nombre)}</p> <p class="text-xs text-indigo-600">${escape_html(INSTITUCION.nivel)}</p></div></div> <h1 class="text-xl font-bold text-gray-900 pt-2">${escape_html(data.salida.titulo)}</h1> <div class="text-sm text-gray-700 grid sm:grid-cols-2 gap-x-4 gap-y-0.5 pt-1"><p>📅 <strong>Fecha:</strong> ${escape_html(data.salida.fecha)}</p> <p>🎓 <strong>Curso:</strong> ${escape_html(data.salida.cursoNombre)}</p> <p>📍 <strong>Destino:</strong> ${escape_html(data.salida.destino)}</p> <p>👤 <strong>Responsable:</strong> ${escape_html(data.salida.responsableNombre)}</p></div> <p class="text-xs text-gray-500 pt-2">Autorizaciones recibidas: <strong class="text-green-700">${escape_html(data.recibidas.length)}</strong> `);
		if (data.pendientes.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`· Pendientes: <strong class="text-amber-700">${escape_html(data.pendientes.length)}</strong>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></p></div> `);
		if (data.pendientes.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card bg-amber-50 border-amber-200 no-print"><p class="text-sm font-semibold text-amber-800 mb-1">⏳ Pendientes (${escape_html(data.pendientes.length)})</p> <p class="text-xs text-amber-700">${escape_html(data.pendientes.map((a) => a.alumnoNombre).join(" · "))}</p></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (data.recibidas.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-10"><p class="text-3xl mb-2">📭</p> <p class="text-gray-500 text-sm">Todavía no se recibieron autorizaciones para esta salida.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-3"><!--[-->`);
			const each_array = ensure_array_like(data.recibidas);
			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let aut = each_array[i];
				$$renderer.push(`<div${attr_class(`card space-y-2 ${stringify(i < data.recibidas.length - 1 ? "pagina-rotura" : "")}`)}><div class="flex items-start justify-between gap-2"><div><p class="font-semibold text-gray-900">${escape_html(aut.alumnoNombre)}</p> <p class="text-xs text-gray-500">Autorización para "${escape_html(data.salida.titulo)}" — ${escape_html(data.salida.cursoNombre)}</p></div> <p class="text-xs text-gray-400 flex-shrink-0">${escape_html(aut.documentoSubidoAt ? new Date(aut.documentoSubidoAt).toLocaleDateString("es-AR") : "")}</p></div> `);
				if (esImagen(aut.documentoPath)) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<img${attr("src", `/autorizar/${stringify(aut.uploadToken)}/archivo`)}${attr("alt", `Autorización de ${stringify(aut.alumnoNombre)}`)} class="w-full max-h-[800px] object-contain border border-gray-200 rounded-lg bg-gray-50"/>`);
				} else if (esPdf(aut.documentoPath)) {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`<embed${attr("src", `/autorizar/${stringify(aut.uploadToken)}/archivo`)} type="application/pdf" class="w-full h-[800px] border border-gray-200 rounded-lg"/> <p class="text-xs text-gray-500 no-print">📎 PDF — <a${attr("href", `/autorizar/${stringify(aut.uploadToken)}/archivo`)} target="_blank" class="text-indigo-600 hover:underline">abrir en nueva pestaña</a></p>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3"><span class="text-2xl">📎</span> <span class="text-sm text-gray-700">Archivo adjunto (${escape_html(ext(aut.documentoPath).toUpperCase())})</span> <a${attr("href", `/autorizar/${stringify(aut.uploadToken)}/archivo`)} target="_blank" class="ml-auto text-xs text-indigo-600 hover:underline no-print">Abrir</a></div>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="card bg-gray-50 no-print text-xs text-gray-600 space-y-1"><p class="font-semibold text-gray-800">💡 Para enviar a supervisión</p> <p>Apretá <strong>Imprimir / Guardar PDF</strong> y elegí "Guardar como PDF" en el destino.
        Te queda un único archivo con todas las autorizaciones que podés adjuntar al mail.</p> <p>Para una autorización individual: abrila desde el listado de la salida y guardala desde el navegador.</p></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DW3-3aKg.js.map
