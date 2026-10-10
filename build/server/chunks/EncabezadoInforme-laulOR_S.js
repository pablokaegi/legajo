import { b as attr, e as escape_html } from './dev-Dj5mSuMo.js';
import { I as INSTITUCION } from './institucional-Ccb6xWsP.js';

//#region src/lib/components/EncabezadoInforme.svelte
function EncabezadoInforme($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { titulo, subtitulo = "" } = $$props;
		const hoy = (/* @__PURE__ */ new Date()).toLocaleDateString("es-AR", {
			day: "numeric",
			month: "long",
			year: "numeric"
		});
		$$renderer.push(`<div class="flex items-start gap-3 border-b-2 border-gray-800 pb-3"><img${attr("src", INSTITUCION.logo)} alt="" class="h-14 w-14 object-contain" onerror="this.__e=event"/> <div class="flex-1 min-w-0"><p class="text-sm font-bold text-gray-900">${escape_html(INSTITUCION.nombre)} — ${escape_html(INSTITUCION.nivel)}</p> <p class="text-[11px] text-gray-500">${escape_html(INSTITUCION.direccion)} · Tel. ${escape_html(INSTITUCION.telefono)} · ${escape_html(INSTITUCION.email)}</p> <p class="text-base font-bold text-gray-900 mt-2">${escape_html(titulo)}</p> `);
		if (subtitulo) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-xs text-gray-600">${escape_html(subtitulo)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <p class="text-[11px] text-gray-500 whitespace-nowrap">Emitido el ${escape_html(hoy)}</p></div>`);
	});
}

export { EncabezadoInforme as E };
//# sourceMappingURL=EncabezadoInforme-laulOR_S.js.map
