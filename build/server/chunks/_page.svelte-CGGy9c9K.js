import { h as head, b as attr, e as escape_html, s as stringify, c as attr_class } from './dev-BsmPEhme.js';
import { I as INSTITUCION } from './institucional-Ccb6xWsP.js';

//#region src/routes/institucional/salidas/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const { salida, imprimir } = data;
		const ESTADO_COLOR = {
			borrador: "bg-gray-100 text-gray-600",
			aprobado: "bg-blue-100 text-blue-700",
			realizado: "bg-green-100 text-green-700",
			cancelado: "bg-red-100 text-red-600"
		};
		const linkAutorizacion = typeof window !== "undefined" ? `${window.location.origin}/autorizar/${salida.uploadToken}` : `/autorizar/${salida.uploadToken}`;
		head("19nw819", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(salida.titulo)} — Legajo</title>`);
			});
		});
		if (imprimir) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="print-only max-w-2xl mx-auto p-6 text-sm text-gray-900"><div class="flex items-center gap-4 border-b-2 border-gray-800 pb-4 mb-6"><img${attr("src", INSTITUCION.logo)} alt="Logo" class="h-16 w-16 object-contain" onerror="this.__e=event"/> <div class="flex-1"><p class="font-bold text-base">${escape_html(INSTITUCION.nombre)}</p> <p class="text-xs">${escape_html(INSTITUCION.nivel)}</p> <p class="text-xs">${escape_html(INSTITUCION.direccion)}</p> <p class="text-xs">Tel.: ${escape_html(INSTITUCION.telefono)} | ${escape_html(INSTITUCION.email)}</p></div></div> <h1 class="text-center text-base font-bold uppercase mb-1">AUTORIZACIÓN DE SALIDA DIDÁCTICA</h1> <p class="text-center text-xs text-gray-500 mb-6">Formulario de autorización – Complete y devuelva firmado</p> <div class="border border-gray-300 rounded p-4 mb-5 space-y-2"><p><strong>Actividad:</strong> ${escape_html(salida.titulo)}</p> <p><strong>Destino:</strong> ${escape_html(salida.destino)}</p> <p><strong>Fecha:</strong> ${escape_html(salida.fecha)}</p> <p><strong>Curso / Grupo:</strong> ${escape_html(salida.cursoNombre)}</p> <p><strong>Docente responsable:</strong> ${escape_html(salida.responsableNombre)}</p> `);
			if (salida.cantidadAlumnos) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p><strong>Cantidad de alumnos:</strong> ${escape_html(salida.cantidadAlumnos)}</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (salida.costoEstimado) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p><strong>Costo estimado por alumno:</strong> ${escape_html(salida.costoEstimado)}</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (salida.descripcion) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="mt-2 text-xs text-gray-700 whitespace-pre-wrap">${escape_html(salida.descripcion)}</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="border border-gray-300 rounded p-4 mb-5"><p class="font-semibold mb-4">Autorización del padre / madre / tutor</p> <p class="mb-6 text-xs">Yo, _________________________________ (nombre y apellido), DNI ___________________,
      en carácter de padre / madre / tutor del/la alumno/a
      _________________________________, autorizo su participación en la salida didáctica
      descripta arriba.</p> <div class="flex gap-8 mt-6"><div class="flex-1"><div class="border-b border-gray-400 mb-1 h-8"></div> <p class="text-xs text-center">Firma y aclaración</p></div> <div class="w-36"><div class="border-b border-gray-400 mb-1 h-8"></div> <p class="text-xs text-center">Fecha</p></div></div></div> <p class="text-xs text-gray-400 text-center">${escape_html(INSTITUCION.nombre)} · ${escape_html(INSTITUCION.direccion)}</p> <div class="no-print mt-6 text-center svelte-19nw819"><button class="btn-primary text-sm">🖨 Imprimir</button> <a${attr("href", `/institucional/salidas/${stringify(salida.id)}`)} class="ml-3 text-sm text-indigo-600 hover:underline">← Volver</a></div></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-4"><div><a href="/institucional/salidas" class="text-indigo-600 text-sm hover:underline">← Salidas</a> <div class="flex items-start justify-between mt-1 gap-2"><h2 class="text-lg font-bold text-gray-900 flex-1">${escape_html(salida.titulo)}</h2> <span${attr_class(`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${stringify(ESTADO_COLOR[salida.estado] ?? "bg-gray-100 text-gray-600")}`, "svelte-19nw819")}>${escape_html(salida.estado)}</span></div></div> `);
			if (form?.error) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">${escape_html(form.error)}</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card space-y-3"><div class="flex justify-between text-sm"><span class="text-gray-500">Fecha</span> <span class="font-medium">${escape_html(salida.fecha)}</span></div> <div class="flex justify-between text-sm"><span class="text-gray-500">Destino</span> <span class="font-medium">${escape_html(salida.destino)}</span></div> <div class="flex justify-between text-sm"><span class="text-gray-500">Curso / Grupo</span> <span class="font-medium">${escape_html(salida.cursoNombre)}</span></div> <div class="flex justify-between text-sm"><span class="text-gray-500">Docente responsable</span> <span class="font-medium">${escape_html(salida.responsableNombre)}</span></div> `);
			if (salida.cantidadAlumnos) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="flex justify-between text-sm"><span class="text-gray-500">Cantidad de alumnos</span> <span class="font-medium">${escape_html(salida.cantidadAlumnos)}</span></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (salida.costoEstimado) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="flex justify-between text-sm"><span class="text-gray-500">Costo estimado</span> <span class="font-medium">${escape_html(salida.costoEstimado)}</span></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (salida.descripcion) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="text-sm"><span class="text-gray-500 block mb-1">Descripción</span> <p class="text-gray-700 whitespace-pre-wrap text-xs">${escape_html(salida.descripcion)}</p></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (salida.notas) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="text-sm"><span class="text-gray-500 block mb-1">Notas internas</span> <p class="text-gray-600 italic text-xs whitespace-pre-wrap">${escape_html(salida.notas)}</p></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> `);
			if (salida.documentoPath) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="card bg-green-50 border-green-200"><p class="text-sm font-medium text-green-800 mb-1">📎 Documento recibido</p> <p class="text-xs text-green-700">${escape_html(salida.documentoNombre ?? "Archivo subido")}</p> `);
				if (salida.documentoSubidoAt) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-green-600 mt-0.5">Subido: ${escape_html(new Date(salida.documentoSubidoAt).toLocaleString("es-AR"))}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <a${attr("href", `/autorizar/${stringify(salida.uploadToken)}/archivo`)} target="_blank" class="mt-2 inline-block text-xs text-green-700 underline hover:text-green-900">Ver documento</a></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="card bg-amber-50 border-amber-200"><p class="text-sm font-medium text-amber-800 mb-1">📋 Documento pendiente</p> <p class="text-xs text-amber-700 mb-2">Todavía no se subió la autorización firmada.</p></div>`);
			}
			$$renderer.push(`<!--]--> <div class="card space-y-2"><p class="text-xs font-semibold text-gray-700">🔗 Link para subir documento (sin login)</p> <p class="text-xs text-gray-500">Compartí este link con el docente para que suba la autorización firmada sin necesidad de ingresar al sistema.</p> <div class="flex gap-2 items-center"><input type="text" readonly=""${attr("value", linkAutorizacion)} class="form-input text-xs flex-1 bg-gray-50 cursor-text"/> <button class="btn-secondary text-xs flex-shrink-0 px-3">Copiar</button></div> <a${attr("href", `/autorizar/${stringify(salida.uploadToken)}`)} target="_blank" class="text-xs text-indigo-600 hover:underline">Abrir link →</a></div> <div class="flex gap-2 flex-wrap"><a${attr("href", `/institucional/salidas/${stringify(salida.id)}?imprimir`)} class="btn-secondary text-sm flex-1 text-center">🖨 Ver autorización</a> <button class="btn-secondary text-sm flex-1">✏️ Editar</button></div>`);
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CGGy9c9K.js.map
