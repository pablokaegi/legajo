import { h as head, b as attr, e as escape_html, s as stringify, c as attr_class, a as ensure_array_like, d as derived } from './dev-BsmPEhme.js';
import './client2-Dql-Fbhv.js';
import { I as INSTITUCION } from './institucional-Ccb6xWsP.js';
import './internal-BLrH_PeT.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/institucional/salidas/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const { salida, autorizaciones } = data;
		const ESTADO_COLOR = {
			borrador: "bg-gray-100 text-gray-600",
			aprobado: "bg-blue-100 text-blue-700",
			realizado: "bg-green-100 text-green-700",
			cancelado: "bg-red-100 text-red-600"
		};
		function linkDeAlumno(token) {
			if (typeof window !== "undefined") return `${window.location.origin}/autorizar/${token}`;
			return `/autorizar/${token}`;
		}
		let copiados = /* @__PURE__ */ new Set();
		const pendientes = derived(() => autorizaciones.filter((a) => !a.documentoPath).length);
		const recibidas = derived(() => autorizaciones.filter((a) => a.documentoPath).length);
		head("19nw819", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(salida.titulo)} — Legajo</title>`);
			});
		});
		if (data.imprimir) {
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
      _________________________________, autorizo su participación en la salida didáctica descripta arriba.</p> <div class="flex gap-8 mt-6"><div class="flex-1"><div class="border-b border-gray-400 mb-1 h-8"></div> <p class="text-xs text-center">Firma y aclaración</p></div> <div class="w-36"><div class="border-b border-gray-400 mb-1 h-8"></div> <p class="text-xs text-center">Fecha</p></div></div></div> <p class="text-xs text-gray-400 text-center">${escape_html(INSTITUCION.nombre)} · ${escape_html(INSTITUCION.direccion)}</p> <div class="no-print mt-6 text-center svelte-19nw819"><button class="btn-primary text-sm">🖨 Imprimir</button> <a${attr("href", `/institucional/salidas/${stringify(salida.id)}`)} class="ml-3 text-sm text-indigo-600 hover:underline">← Volver</a></div></div>`);
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
			$$renderer.push(`<!--]--></div> <div class="border border-gray-200 rounded-xl overflow-hidden"><div class="bg-indigo-50 px-4 py-3 flex items-center justify-between border-b border-indigo-100"><div class="flex items-center gap-2"><span class="text-sm font-semibold text-indigo-800">👥 Autorizaciones por alumno</span> `);
			if (autorizaciones.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span${attr_class(`text-xs px-1.5 py-0.5 rounded-full font-semibold ${stringify(pendientes() === 0 ? "bg-green-600 text-white" : "bg-amber-500 text-white")}`)}>${escape_html(recibidas())}/${escape_html(autorizaciones.length)}</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> `);
			if (autorizaciones.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button type="button" class="text-xs text-indigo-600 hover:underline font-medium">${escape_html("+ Agregar más")}</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> `);
			if (autorizaciones.length > 0) {
				$$renderer.push("<!--[0-->");
				if (pendientes() > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">⏳ ${escape_html(pendientes())} alumno${escape_html(pendientes() !== 1 ? "s" : "")} pendiente${escape_html(pendientes() !== 1 ? "s" : "")} de enviar autorización</div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<div class="mx-4 mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">✅ Todos los alumnos presentaron su autorización</div>`);
				}
				$$renderer.push(`<!--]--> <div class="divide-y divide-gray-100 mt-2"><!--[-->`);
				const each_array = ensure_array_like(autorizaciones);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let aut = each_array[$$index];
					$$renderer.push(`<div class="px-4 py-3 space-y-2"><div class="flex items-center gap-3"><div${attr_class(`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${stringify(aut.documentoPath ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}`)}>${escape_html(aut.alumnoNombre.split(" ").map((w) => w[0]).slice(0, 2).join(""))}</div> <div class="flex-1 min-w-0"><p class="text-sm font-medium text-gray-900 truncate">${escape_html(aut.alumnoNombre)}</p> `);
					if (aut.documentoPath) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<p class="text-xs text-green-600 font-medium">✅ Autorización recibida
                        ${escape_html(aut.documentoSubidoAt ? "· " + new Date(aut.documentoSubidoAt).toLocaleDateString("es-AR") : "")}</p>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<p class="text-xs text-amber-600">⏳ Pendiente de autorización</p>`);
					}
					$$renderer.push(`<!--]--></div> `);
					if (aut.documentoPath) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<a${attr("href", `/autorizar/${stringify(aut.uploadToken)}/archivo`)} target="_blank" class="text-xs text-indigo-600 hover:underline flex-shrink-0">Ver doc</a>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div> <button type="button"${attr_class(`w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${stringify(copiados.has(aut.uploadToken) ? "border-green-300 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700")}`)}><span class="text-sm">${escape_html(copiados.has(aut.uploadToken) ? "✅" : "🔗")}</span> <span class="flex-1 text-left truncate font-mono text-xs opacity-70">${escape_html(linkDeAlumno(aut.uploadToken))}</span> <span class="font-semibold flex-shrink-0">${escape_html(copiados.has(aut.uploadToken) ? "¡Copiado!" : "Copiar link")}</span></button></div>`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="flex gap-2 flex-wrap"><a${attr("href", `/institucional/salidas/${stringify(salida.id)}?imprimir`)} class="btn-secondary text-sm flex-1 text-center">🖨 Ver autorización</a> <button class="btn-secondary text-sm flex-1">✏️ Editar</button></div>`);
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Bg40A03V.js.map
