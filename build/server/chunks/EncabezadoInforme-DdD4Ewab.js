import { a as attr, e as escape_html, f as derived } from './dev-CsaMOlNk.js';
import { p as page } from './state-BTDbInvN.js';

//#region src/lib/components/EncabezadoInforme.svelte
function EncabezadoInforme($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const institucion = derived(() => page.data.institucion);
		let { titulo, subtitulo = "" } = $$props;
		const hoy = (/* @__PURE__ */ new Date()).toLocaleDateString("es-AR", {
			day: "numeric",
			month: "long",
			year: "numeric"
		});
		$$renderer.push(`<div class="flex items-start gap-3 border-b-2 border-gray-800 pb-3"><img${attr("src", institucion().icono)} alt="" class="h-14 w-14 object-contain" onerror="this.__e=event"/> <div class="flex-1 min-w-0"><p class="text-sm font-bold text-gray-900">${escape_html(institucion().nombre)} — ${escape_html(institucion().nivel)}</p> `);
		if (institucion().direccion) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-[11px] text-gray-500">${escape_html(institucion().direccion)} · Tel. ${escape_html(institucion().telefono)} · ${escape_html(institucion().email)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <p class="text-base font-bold text-gray-900 mt-2">${escape_html(titulo)}</p> `);
		if (subtitulo) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-xs text-gray-600">${escape_html(subtitulo)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <p class="text-[11px] text-gray-500 whitespace-nowrap">Emitido el ${escape_html(hoy)}</p></div>`);
	});
}

export { EncabezadoInforme as E };
//# sourceMappingURL=EncabezadoInforme-DdD4Ewab.js.map
