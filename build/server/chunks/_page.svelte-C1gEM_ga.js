import { h as head, a as attr, e as escape_html, r as run, d as ensure_array_like, f as derived } from './dev-CsaMOlNk.js';
import './client2-i6F8J7u1.js';
import './apoyos-DDSemfdS.js';
import { e as esquemaLibro } from './libro-ciencias-B_zFdv1Z.js';
import './internal-BSUXWn6e.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';
import 'zod';
import './aula-rest-Gaa3l_kU.js';
import './db-CLN6I8p_.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './rest-qugARKMk.js';
import 'node:child_process';

//#region src/routes/laboratorio/apoyos/libro/Editor.svelte
function Editor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { inicial, revision } = $$props;
		let actividad = run(() => esquemaLibro.parse(inicial));
		let publicando = false;
		let confirmado = false;
		$$renderer.push(`<form class="space-y-4" method="POST" action="?/publicar"><input type="hidden" name="revision"${attr("value", revision)}/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <fieldset${attr("disabled", publicando, true)} class="card space-y-3"><legend class="sr-only">Datos del Libro</legend> <label class="form-label">Título del Libro<input name="titulo" class="form-input"${attr("value", actividad.titulo)} maxlength="120" required=""/></label> <label class="form-label">Objetivo de aprendizaje<textarea name="objetivo" class="form-input" rows="2" maxlength="500" required="">`);
		const $$body = escape_html(actividad.objetivo);
		if ($$body) $$renderer.push(`${$$body}`);
		$$renderer.push(`</textarea></label></fieldset> <!--[-->`);
		const each_array = ensure_array_like(actividad.pasos);
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let paso = each_array[i];
			$$renderer.push(`<fieldset class="card space-y-3"${attr("disabled", publicando, true)}><legend class="px-1 text-lg font-semibold">Paso ${escape_html(i + 1)}</legend> <input type="hidden" name="pasoId"${attr("value", paso.id)}/> <label class="form-label">Título del capítulo<input${attr("id", "titulo-" + paso.id)} class="form-input" name="pasoTitulo"${attr("value", paso.titulo)} maxlength="120" required=""/></label> <label class="form-label">Consigna escrita<textarea class="form-input" name="pasoConsigna" rows="3" maxlength="1400" required="">`);
			const $$body_1 = escape_html(paso.consigna);
			if ($$body_1) $$renderer.push(`${$$body_1}`);
			$$renderer.push(`</textarea></label> <label class="form-label">Guion de audio opcional <span class="block text-sm font-normal text-gray-600">El estudiante podrá escucharlo o leer su transcripción. Dejá el campo vacío para usar sólo la consigna.</span> <textarea class="form-input" name="pasoAudio" rows="2" maxlength="1400">`);
			const $$body_2 = escape_html(paso.audio);
			if ($$body_2) $$renderer.push(`${$$body_2}`);
			$$renderer.push(`</textarea></label> <button class="text-sm font-medium underline text-indigo-800" type="button"${attr("disabled", !paso.consigna.trim() || paso.audio === paso.consigna, true)}>Usar la consigna como guion</button> <div class="flex flex-wrap gap-2"><button type="button" class="btn-secondary"${attr("aria-label", "Subir el paso " + (i + 1))}${attr("disabled", i === 0, true)}>Subir</button> <button type="button" class="btn-secondary"${attr("aria-label", "Bajar el paso " + (i + 1))}${attr("disabled", i === actividad.pasos.length - 1, true)}>Bajar</button> <button type="button" class="btn-secondary"${attr("aria-label", "Quitar el paso " + (i + 1))}${attr("disabled", actividad.pasos.length === 1, true)}>Quitar</button></div></fieldset>`);
		}
		$$renderer.push(`<!--]--> <button class="btn-secondary" type="button"${attr("disabled", actividad.pasos.length >= 8, true)}>Agregar paso</button> <div class="card space-y-3"><label class="flex items-center gap-2"><input type="checkbox" name="confirmar" value="si" required=""${attr("checked", confirmado, true)}${attr("disabled", publicando, true)}/> Confirmo que estos capítulos se pueden compartir con el curso de Ciencias.</label> <button class="btn-primary" type="submit"${attr("disabled", publicando, true)}>${escape_html("Publicar en Moodle")}</button></div></form>`);
	});
}
//#endregion
//#region src/routes/laboratorio/apoyos/libro/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const fuente = derived(() => form?.borrador ?? data);
		head("16qnwg4", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Actividad de Ciencias por pasos · Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><a class="text-sm underline text-indigo-800" href="/laboratorio/apoyos">Volver al Laboratorio de apoyos</a> <header><h1 class="text-2xl font-semibold">Actividad de Ciencias por pasos</h1> <p class="mt-2 text-sm text-gray-700">Cada paso será un capítulo del Libro de Moodle. Podés incluir una narración en español junto a la consigna escrita.</p> `);
		if (data.url) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<a class="mt-2 inline-block font-medium underline text-indigo-800"${attr("href", data.url)} target="_blank" rel="noreferrer">Abrir el Libro publicado en Moodle</a>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></header> `);
		if (form?.resultado) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="card bg-green-50 text-green-900" role="status">${escape_html(form.resultado.cambio ? "Libro publicado en Moodle." : "El Libro ya tiene este contenido.")} Versión ${escape_html(form.resultado.revision)}.</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p role="alert" class="card bg-amber-50 text-amber-900">${escape_html(form.error)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <!---->`);
		Editor($$renderer, {
			inicial: fuente().actividad,
			revision: fuente().revision
		});
		$$renderer.push(`<!----></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-C1gEM_ga.js.map
