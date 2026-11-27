import { h as head, a as attr, e as escape_html, d as ensure_array_like, b as attr_class, f as derived } from './dev-CsaMOlNk.js';
import { d as demoInicial } from './apoyos-DDSemfdS.js';
import 'zod';

//#region src/lib/laboratorio/DemoApoyos.svelte
function DemoApoyos($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let demo = demoInicial();
		let vista = "editor";
		let listo = false;
		let aviso = "";
		const vistas = [
			{
				id: "editor",
				nombre: "Editor de actividad"
			},
			{
				id: "alumno",
				nombre: "Vista del estudiante"
			},
			{
				id: "apoyo",
				nombre: "Ficha de apoyos"
			}
		];
		const total = derived(() => demo.actividad.pasos.length);
		head("6ju7t4", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Laboratorio de apoyos · Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="laboratorio svelte-6ju7t4"${attr("data-ready", listo)}><header class="encabezado svelte-6ju7t4"><p class="marca svelte-6ju7t4">Legajo / Ciencias</p> <h1 class="svelte-6ju7t4">Laboratorio de apoyos</h1> <p>Demo ficticia. Los cambios y el progreso se guardan en este navegador.</p></header> <nav aria-label="Vistas del laboratorio" class="svelte-6ju7t4"><!--[-->`);
		const each_array = ensure_array_like(vistas);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let opcion = each_array[$$index];
			$$renderer.push(`<button type="button"${attr("aria-pressed", vista === opcion.id)}${attr_class("svelte-6ju7t4", void 0, { "seleccionado": vista === opcion.id })}>${escape_html(opcion.nombre)}</button>`);
		}
		$$renderer.push(`<!--]--></nav> `);
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<form class="panel svelte-6ju7t4"><h2 class="svelte-6ju7t4">Prepará la actividad</h2> <div class="campos svelte-6ju7t4"><label class="svelte-6ju7t4">Título <input${attr("value", demo.actividad.titulo)} required="" maxlength="120" class="svelte-6ju7t4"/></label> <label class="svelte-6ju7t4">Objetivo <textarea required="" maxlength="500" rows="2" class="svelte-6ju7t4">`);
			const $$body = escape_html(demo.actividad.objetivo);
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea></label> <label class="svelte-6ju7t4">Enlace a la actividad en Moodle (opcional) <input type="url"${attr("value", demo.actividad.moodleUrl)} maxlength="2048" placeholder="https://…" class="svelte-6ju7t4"/></label></div> <!--[-->`);
			const each_array_1 = ensure_array_like(demo.actividad.pasos);
			for (let indice = 0, $$length = each_array_1.length; indice < $$length; indice++) {
				let item = each_array_1[indice];
				$$renderer.push(`<fieldset class="svelte-6ju7t4"><legend class="svelte-6ju7t4">Paso ${escape_html(indice + 1)}</legend> <div class="campos svelte-6ju7t4"><label class="svelte-6ju7t4">Título del paso <input${attr("value", item.titulo)} required="" maxlength="120" class="svelte-6ju7t4"/></label> <label class="svelte-6ju7t4">Consigna <textarea required="" maxlength="1400" rows="3" class="svelte-6ju7t4">`);
				const $$body_1 = escape_html(item.consigna);
				if ($$body_1) $$renderer.push(`${$$body_1}`);
				$$renderer.push(`</textarea></label> <label class="svelte-6ju7t4">Guion para escuchar (opcional) <textarea maxlength="1400" rows="2" class="svelte-6ju7t4">`);
				const $$body_2 = escape_html(item.audio);
				if ($$body_2) $$renderer.push(`${$$body_2}`);
				$$renderer.push(`</textarea></label></div> <div class="acciones svelte-6ju7t4"><button type="button"${attr("disabled", indice === 0, true)} class="svelte-6ju7t4">Subir paso</button> <button type="button"${attr("disabled", indice === total() - 1, true)} class="svelte-6ju7t4">Bajar paso</button> <button type="button"${attr("disabled", total() === 1, true)} class="svelte-6ju7t4">Quitar paso</button></div></fieldset>`);
			}
			$$renderer.push(`<!--]--> <div class="acciones svelte-6ju7t4"><button type="button"${attr("disabled", total() >= 8, true)} class="svelte-6ju7t4">Agregar paso</button> <button type="button" class="svelte-6ju7t4">Descargar HTML para Moodle</button> <button type="submit" class="principal svelte-6ju7t4">Guardar actividad</button></div></form>`);
		}
		$$renderer.push(`<!--]--> <p class="estado svelte-6ju7t4" role="status">${escape_html(aviso)}</p></div>`);
	});
}
//#endregion
//#region src/routes/laboratorio/apoyos/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let mostrarEjemplo = false;
		head("1evdr4t", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Laboratorio de apoyos · Legajo</title>`);
			});
		});
		if (data.fichas) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mx-auto max-w-3xl space-y-5"><header><p class="text-sm font-medium text-indigo-700">Ciencias · Curso de prueba</p> <h1 class="mt-1 text-3xl font-bold text-gray-900">Laboratorio de apoyos</h1></header> <div class="grid gap-3 sm:grid-cols-2"><a class="card block hover:border-indigo-400" href="/laboratorio/apoyos/fichas"><strong class="block text-lg text-indigo-800">Fichas de apoyos</strong> <span class="mt-1 block text-sm text-gray-700">Registrá el apoyo acordado con cada estudiante y su próxima revisión.</span></a> `);
			if (data.libro) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<a class="card block hover:border-indigo-400" href="/laboratorio/apoyos/libro"><strong class="block text-lg text-indigo-800">Libro de Ciencias</strong> <span class="mt-1 block text-sm text-gray-700">Editá los pasos y publicalos en el campus con la lectura que elijas.</span></a>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <button class="min-h-11 text-sm text-indigo-800 underline" type="button"${attr("aria-expanded", mostrarEjemplo)}>${escape_html("Ver ejemplo guardado en este navegador")}</button></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (!data.fichas || mostrarEjemplo) {
			$$renderer.push("<!--[0-->");
			DemoApoyos($$renderer);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BRxW1JXa.js.map
