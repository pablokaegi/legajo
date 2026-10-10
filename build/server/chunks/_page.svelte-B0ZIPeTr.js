import { h as head, e as escape_html, a as ensure_array_like, c as attr_class, s as stringify, b as attr } from './dev-Dj5mSuMo.js';
import { A as AVISO_URGENTE } from './categorias-BK8Z_nGh.js';
import './client2-BLuH5cYu.js';
import { S as SelectorCategorias } from './SelectorCategorias-BLURhBvd.js';
import './internal-DGke0biV.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/derivar/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let categorias = [];
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			head("1un9798", $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Derivar al gabinete — Legajo</title>`);
				});
			});
			$$renderer.push(`<div class="space-y-4 max-w-xl"><div><h1 class="text-lg font-bold text-gray-900">🧠 Derivar al gabinete psicopedagógico</h1> <p class="text-xs text-gray-500">Lo recibe solo el gabinete. Describí lo que observaste con hechos concretos (qué, cuándo, dónde), sin
      etiquetas; y contá también qué le sale bien: es el punto de apoyo para ayudarlo.</p></div> `);
			if (form?.error) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (form?.ok) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-3 space-y-2"><p>${escape_html(form.ok)}</p> `);
				if (form.urgente) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-red-700 font-medium">⚠️ ${escape_html(AVISO_URGENTE)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <a href="/derivar" class="text-xs underline">Hacer otra derivación</a></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<form method="POST" class="card space-y-3"><div><label class="form-label" for="curso">Curso</label> <select id="curso" name="cursoId" class="form-input" required="">`);
				$$renderer.option({ value: "" }, ($$renderer) => {
					$$renderer.push(`Elegí el curso…`);
				});
				$$renderer.push(`<!--[-->`);
				const each_array = ensure_array_like(data.cursos);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let c = each_array[$$index];
					$$renderer.option({
						value: c.id,
						selected: c.id === data.cursoId
					}, ($$renderer) => {
						$$renderer.push(`${escape_html(c.nombre)}`);
					});
				}
				$$renderer.push(`<!--]--></select></div> `);
				if (data.cursoId) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div><label class="form-label" for="alumno">Alumno</label> <select id="alumno" name="alumnoId" class="form-input" required="">`);
					$$renderer.option({ value: "" }, ($$renderer) => {
						$$renderer.push(`Elegí el alumno…`);
					});
					$$renderer.push(`<!--[-->`);
					const each_array_1 = ensure_array_like(data.alumnos);
					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let a = each_array_1[$$index_1];
						$$renderer.option({
							value: a.id,
							selected: a.id === data.alumnoId
						}, ($$renderer) => {
							$$renderer.push(`${escape_html(a.nombre)}`);
						});
					}
					$$renderer.push(`<!--]--></select></div> <div><p class="form-label">Motivo <span class="text-gray-400 font-normal">(elegí uno o varios)</span></p> `);
					SelectorCategorias($$renderer, {
						get seleccionadas() {
							return categorias;
						},
						set seleccionadas($$value) {
							categorias = $$value;
							$$settled = false;
						}
					});
					$$renderer.push(`<!----></div> <div><label class="form-label" for="obs">Detalle: ¿qué observaste? <span class="text-gray-400 font-normal">(recomendado)</span></label> <textarea id="obs" name="queObservo" rows="3" maxlength="3000" class="form-input" placeholder="Ej.: en las últimas semanas trabaja solo, no entrega las actividades y en los recreos está aislado."></textarea></div> <div><label class="form-label" for="desde">¿Desde cuándo? <span class="text-gray-400 font-normal">(opcional)</span></label> <input id="desde" name="desdeCuando" maxlength="300" class="form-input" placeholder="Ej.: desde las vacaciones de invierno"/></div> <div><label class="form-label" for="hizo">¿Qué intentaste en el aula? <span class="text-gray-400 font-normal">(opcional)</span></label> <textarea id="hizo" name="queSeHizo" rows="2" maxlength="2000" class="form-input"></textarea></div> <div><label class="form-label" for="fort">¿Qué le sale bien? <span class="text-gray-400 font-normal">(fortalezas)</span></label> <textarea id="fort" name="fortalezas" rows="2" maxlength="2000" class="form-input"></textarea></div> <button type="submit"${attr_class(`btn-primary w-full ${stringify(categorias.length ? "" : "opacity-50")}`)}${attr("disabled", categorias.length === 0, true)}>${escape_html("Enviar al gabinete")}</button>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></form>`);
			}
			$$renderer.push(`<!--]--></div>`);
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
//# sourceMappingURL=_page.svelte-B0ZIPeTr.js.map
