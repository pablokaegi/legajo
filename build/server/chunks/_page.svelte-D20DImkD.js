import { h as head, b as attr, e as escape_html, c as attr_class, s as stringify } from './dev-BsmPEhme.js';
import { I as INSTITUCION } from './institucional-Ccb6xWsP.js';

//#region src/routes/autorizar/[token]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const { aut } = data;
		const { salida } = aut;
		let enviando = false;
		const yaSubido = aut.documentoPath || form?.ok;
		head("1x807wy", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Autorización — ${escape_html(salida.titulo)}</title>`);
			});
		});
		$$renderer.push(`<div class="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4"><div class="w-full max-w-lg bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><div class="bg-indigo-700 text-white px-5 py-4 flex items-center gap-3"><img${attr("src", INSTITUCION.logo)} alt="Logo PDS" class="h-12 w-12 object-contain bg-white rounded-lg p-1 flex-shrink-0" onerror="this.__e=event"/> <div><p class="font-bold text-sm">${escape_html(INSTITUCION.nombre)}</p> <p class="text-xs text-indigo-200">${escape_html(INSTITUCION.nivel)}</p> <p class="text-xs text-indigo-200">${escape_html(INSTITUCION.telefono)} · ${escape_html(INSTITUCION.email)}</p></div></div> <div class="p-5 space-y-5"><div class="bg-indigo-50 rounded-xl px-4 py-3 flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0"><span class="text-indigo-700 font-bold text-base">${escape_html(aut.alumnoNombre.split(" ").map((w) => w[0]).slice(0, 2).join(""))}</span></div> <div><p class="text-xs text-indigo-500 font-medium">Alumno/a</p> <p class="font-semibold text-indigo-900">${escape_html(aut.alumnoNombre)}</p></div></div> <div><h1 class="text-base font-bold text-gray-900">${escape_html(salida.titulo)}</h1></div> <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm"><div class="flex justify-between"><span class="text-gray-500">Destino</span> <span class="font-medium text-right">${escape_html(salida.destino)}</span></div> <div class="flex justify-between"><span class="text-gray-500">Fecha</span> <span class="font-medium">${escape_html(salida.fecha)}</span></div> <div class="flex justify-between"><span class="text-gray-500">Curso</span> <span class="font-medium">${escape_html(salida.cursoNombre)}</span></div> <div class="flex justify-between"><span class="text-gray-500">Docente</span> <span class="font-medium text-right">${escape_html(salida.responsableNombre)}</span></div> `);
		if (salida.costoEstimado) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="flex justify-between"><span class="text-gray-500">Costo estimado</span> <span class="font-medium">${escape_html(salida.costoEstimado)}</span></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (yaSubido) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center"><p class="text-3xl mb-2">✅</p> <p class="text-sm font-semibold text-green-800">¡Autorización recibida!</p> <p class="text-xs text-green-600 mt-1">La autorización de <strong>${escape_html(aut.alumnoNombre)}</strong> fue enviada correctamente al establecimiento.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			if (form?.error) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">${escape_html(form.error)}</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="text-sm text-gray-600 space-y-1"><p class="font-medium text-gray-800">📎 Subir autorización firmada</p> <p class="text-xs text-gray-500">Tomá una foto o escaneá la autorización con la firma del padre/madre/tutor
            y subila en formato PDF, JPG o PNG (máx. 10 MB).</p></div> <form method="POST" action="?/subir" enctype="multipart/form-data" class="space-y-3"><div><label class="form-label">Seleccionar archivo *</label> <input type="file" name="archivo" accept=".pdf,.jpg,.jpeg,.png,.webp" required="" class="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"/></div> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <button type="submit"${attr("disabled", enviando, true)}${attr_class(`btn-primary w-full text-sm ${stringify("")}`)}>${escape_html("⬆ Enviar autorización")}</button></form>`);
		}
		$$renderer.push(`<!--]--></div> <div class="bg-gray-50 border-t border-gray-100 px-5 py-3 text-xs text-gray-400 text-center">${escape_html(INSTITUCION.nombre)} · ${escape_html(INSTITUCION.direccion)}</div></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-D20DImkD.js.map
