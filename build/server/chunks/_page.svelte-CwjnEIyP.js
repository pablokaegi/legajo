import { h as head, d as ensure_array_like, e as escape_html, a as attr, f as derived } from './dev-CsaMOlNk.js';
import './apoyos-DDSemfdS.js';
import 'zod';

//#region src/routes/laboratorio/apoyos/fichas/EvidenciasCiencias.svelte
function EvidenciasCiencias($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { evidencias, alumno, ficha } = $$props;
		const fecha = new Intl.DateTimeFormat("es-AR", {
			dateStyle: "short",
			timeStyle: "short",
			timeZone: "America/Argentina/Cordoba"
		});
		const numero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });
		$$renderer.push(`<section class="card space-y-4" aria-labelledby="evidencias-ciencias"><header class="flex flex-wrap items-baseline justify-between gap-2"><h2 id="evidencias-ciencias" class="text-xl font-semibold text-gray-900">Evidencia de Ciencias de ${escape_html(alumno)}</h2> <a class="text-sm font-medium text-indigo-700 underline" href="#decision-apoyo">Revisar el apoyo</a></header> `);
		if (ficha) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="rounded-lg bg-indigo-50 px-3 py-2"><h3 class="text-sm font-semibold text-gray-900">Apoyo acordado</h3> <p class="whitespace-pre-wrap text-sm text-gray-800">${escape_html(ficha.ajuste)}</p> <p class="mt-1 text-sm text-gray-700">${escape_html(ficha.ofrecido === "si" ? "Se ofreció el apoyo." : ficha.ofrecido === "no" ? "No se ofreció el apoyo." : "Pendiente de registrar si se ofreció.")}</p></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="grid gap-4 border-y border-gray-200 py-3 sm:grid-cols-2"><div><h3 class="font-semibold text-gray-900">Cuestionario de Moodle</h3> `);
		if (evidencias.cuestionario.url) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<a class="text-indigo-700 underline"${attr("href", evidencias.cuestionario.url)} target="_blank" rel="noreferrer">${escape_html(evidencias.cuestionario.titulo)}</a>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (evidencias.cuestionario.ultimo) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm text-gray-700">Último intento · ${escape_html(evidencias.cuestionario.ultimo.numero)} · ${escape_html(evidencias.cuestionario.ultimo.estado)}</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="text-sm text-gray-700">${escape_html(evidencias.cuestionario.estado)}</p>`);
		}
		$$renderer.push(`<!--]--></div> <div><h3 class="font-semibold text-gray-900">Libro de Moodle</h3> `);
		if (evidencias.libro.url) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<a class="text-indigo-700 underline"${attr("href", evidencias.libro.url)} target="_blank" rel="noreferrer">${escape_html(evidencias.libro.titulo)}</a>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <p class="text-sm text-gray-700">${escape_html(evidencias.libro.estado)}${escape_html(evidencias.libro.revision ? " · Versión " + evidencias.libro.revision : "")}</p></div></div> <div><h3 class="font-semibold text-gray-900">Resultados por objetivo</h3> `);
		if (evidencias.cuestionario.intento) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm text-gray-600">Puntajes del intento ${escape_html(evidencias.cuestionario.intento.numero)} `);
			if (evidencias.cuestionario.intento.fecha) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`· ${escape_html(fecha.format(evidencias.cuestionario.intento.fecha * 1e3))}`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="grid gap-3 lg:grid-cols-3"><!--[-->`);
		const each_array = ensure_array_like(evidencias.objetivos);
		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let objetivo = each_array[$$index_1];
			$$renderer.push(`<article class="rounded-lg border border-gray-200 p-3"><h4 class="font-semibold text-gray-900">${escape_html(objetivo.nombre)}</h4> <p class="mt-1 flex flex-wrap items-baseline gap-x-1 text-sm text-gray-800" data-resultado="">`);
			if (objetivo.puntaje !== null) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<strong>${escape_html(numero.format(objetivo.puntaje))}/1</strong><span aria-hidden="true">·</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <span>${escape_html(objetivo.estado)}</span></p> `);
			if (objetivo.capitulos.length) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="mt-3 text-sm font-medium text-gray-700">Para practicar en el Libro</p> <ul class="mt-1 space-y-1 text-sm"><!--[-->`);
				const each_array_1 = ensure_array_like(objetivo.capitulos);
				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let capitulo = each_array_1[$$index];
					$$renderer.push(`<li><a class="text-indigo-700 underline"${attr("href", capitulo.url)} target="_blank" rel="noreferrer">${escape_html(capitulo.titulo)}</a> `);
					if (capitulo.audio) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="text-gray-600">· Audio opcional</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></li>`);
				}
				$$renderer.push(`<!--]--></ul>`);
			} else if (evidencias.libro.url) {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<p class="mt-3 text-sm text-gray-600">Sin capítulo vinculado a este objetivo.</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></article>`);
		}
		$$renderer.push(`<!--]--></div></section>`);
	});
}
//#endregion
//#region src/routes/laboratorio/apoyos/fichas/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const vacia = {
			barrera: "",
			ajuste: "",
			responsable: "",
			revision: "",
			ofrecido: "pendiente",
			observacion: "",
			decision: "pendiente"
		};
		const etiquetas = {
			barrera: "Barrera observada",
			ajuste: "Apoyo acordado",
			responsable: "Responsable",
			revision: "Fecha de revisión",
			ofrecido: "¿Se ofreció el apoyo?",
			observacion: "Observación",
			decision: "Próxima decisión"
		};
		const campos = Object.keys(etiquetas);
		const respuesta = derived(() => form?.alumnoId === data.alumno?.id ? form : null);
		const valores = derived(() => ({
			...vacia,
			...data.ficha,
			...respuesta()?.borrador
		}));
		const conflicto = derived(() => Boolean(respuesta()?.conflicto && data.ficha));
		const version = derived(() => conflicto() ? data.ficha.version : respuesta()?.version ?? data.ficha?.version ?? 0);
		head("1bbkz1s", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Ficha de apoyos · Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><header class="space-y-1"><a href="/laboratorio/apoyos" class="text-sm text-indigo-700 underline">Volver al laboratorio de apoyos</a> <h1 class="text-2xl font-bold text-gray-900">Ficha de apoyos</h1> <p class="text-sm text-gray-700">Acuerdos de Ciencias entre el docente y el gabinete. La ficha queda en Legajo.</p></header> `);
		if (data.alumno) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<form method="GET" class="card flex flex-wrap items-end gap-3"><label class="min-w-44 flex-1"><span class="form-label">Estudiante</span> `);
			$$renderer.select({
				class: "form-input",
				name: "alumnoId",
				value: data.alumno.id
			}, ($$renderer) => {
				$$renderer.push(`<!--[-->`);
				const each_array = ensure_array_like(data.alumnos);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let alumno = each_array[$$index];
					$$renderer.option({ value: alumno.id }, ($$renderer) => {
						$$renderer.push(`${escape_html(alumno.nombre)}`);
					});
				}
				$$renderer.push(`<!--]-->`);
			});
			$$renderer.push(`</label> <button type="submit" class="btn-secondary min-h-11">Abrir ficha</button></form> <!---->`);
			{
				if (data.gabinete) {
					$$renderer.push("<!--[0-->");
					if (data.evidencias) {
						$$renderer.push("<!--[0-->");
						EvidenciasCiencias($$renderer, {
							evidencias: data.evidencias,
							alumno: data.alumno.nombre,
							ficha: data.ficha
						});
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<p role="status" class="card text-amber-900">Las evidencias de Ciencias están pendientes de lectura. Podés consultar el acuerdo y guardar tu revisión en Legajo.</p>`);
					}
					$$renderer.push(`<!--]-->`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <form method="POST"${attr("action", "?/guardar&alumnoId=" + data.alumno.id)} class="card space-y-4" autocomplete="off"><div><h2 class="text-xl font-semibold text-gray-900">${escape_html(data.alumno.nombre)}</h2> <p class="text-sm text-gray-600">${escape_html(data.ficha ? "Versión guardada en Legajo: " + data.ficha.version : "Ficha nueva")}</p></div> `);
				if (form?.error) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p role="alert" class="rounded border border-amber-300 bg-amber-50 p-3">${escape_html(form.error)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (respuesta()?.guardada) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p role="status" class="rounded bg-green-50 p-3 text-green-900">Ficha guardada en Legajo.</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (conflicto() && data.ficha) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<details open="" class="rounded border p-3"><summary class="cursor-pointer font-semibold">Compará la ficha guardada con tus cambios</summary> <dl class="mt-2 space-y-2 text-sm"><!--[-->`);
					const each_array_1 = ensure_array_like(campos);
					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let campo = each_array_1[$$index_1];
						$$renderer.push(`<div><dt class="font-semibold">${escape_html(etiquetas[campo])}</dt><dd class="whitespace-pre-wrap">${escape_html(data.ficha[campo] || "Sin registrar")}</dd></div>`);
					}
					$$renderer.push(`<!--]--></dl></details> <label class="flex items-center gap-2"><input type="checkbox" required=""/> Revisé la versión guardada y confirmé qué datos quiero conservar.</label>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <input type="hidden" name="alumnoId"${attr("value", data.alumno.id)}/> <input type="hidden" name="version"${attr("value", version())}/> `);
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <label class="block"><span class="form-label">${escape_html(etiquetas.barrera)}</span> <textarea name="barrera" class="form-input" required="" rows="2" maxlength="500">`);
				const $$body = escape_html(valores().barrera);
				if ($$body) $$renderer.push(`${$$body}`);
				$$renderer.push(`</textarea></label> <label class="block"><span class="form-label">${escape_html(etiquetas.ajuste)}</span> <textarea name="ajuste" class="form-input" required="" rows="2" maxlength="500">`);
				const $$body_1 = escape_html(valores().ajuste);
				if ($$body_1) $$renderer.push(`${$$body_1}`);
				$$renderer.push(`</textarea></label> <div class="grid gap-3 sm:grid-cols-2"><label><span class="form-label">${escape_html(etiquetas.responsable)}</span> <input name="responsable" class="form-input" required="" maxlength="120"${attr("value", valores().responsable)}/></label> <label><span class="form-label">${escape_html(etiquetas.revision)}</span> <input type="date" name="revision" class="form-input" required="" min="1000-01-01" max="9999-12-31"${attr("value", valores().revision)}/></label></div> <label class="block"><span class="form-label">${escape_html(etiquetas.ofrecido)}</span> `);
				$$renderer.select({
					name: "ofrecido",
					class: "form-input",
					value: valores().ofrecido
				}, ($$renderer) => {
					$$renderer.option({ value: "pendiente" }, ($$renderer) => {
						$$renderer.push(`Pendiente`);
					});
					$$renderer.option({ value: "si" }, ($$renderer) => {
						$$renderer.push(`Sí`);
					});
					$$renderer.option({ value: "no" }, ($$renderer) => {
						$$renderer.push(`No`);
					});
				});
				$$renderer.push(`</label> `);
				if (data.gabinete) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<h3 id="decision-apoyo" class="scroll-mt-20 text-lg font-semibold text-gray-900">Revisión del apoyo</h3> <p class="text-sm text-gray-700">Considerá los objetivos del cuestionario y lo que observaron al ofrecer el apoyo. Podés anotar el motivo de tu decisión en la ficha compartida con el docente.</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <label class="block"><span class="form-label">Observación pedagógica (opcional)</span> <textarea name="observacion" class="form-input" rows="2" maxlength="500">`);
				const $$body_2 = escape_html(valores().observacion);
				if ($$body_2) $$renderer.push(`${$$body_2}`);
				$$renderer.push(`</textarea></label> <label class="block"><span class="form-label">${escape_html(etiquetas.decision)}</span> `);
				$$renderer.select({
					name: "decision",
					class: "form-input",
					value: valores().decision
				}, ($$renderer) => {
					$$renderer.option({ value: "pendiente" }, ($$renderer) => {
						$$renderer.push(`Pendiente de revisión`);
					});
					$$renderer.option({ value: "mantener" }, ($$renderer) => {
						$$renderer.push(`Mantener el apoyo`);
					});
					$$renderer.option({ value: "ajustar" }, ($$renderer) => {
						$$renderer.push(`Ajustar el apoyo`);
					});
					$$renderer.option({ value: "cerrar" }, ($$renderer) => {
						$$renderer.push(`Cerrar el acuerdo`);
					});
				});
				$$renderer.push(`</label> <button type="submit" class="btn-primary min-h-11">Guardar ficha en Legajo</button></form>`);
			}
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="card">El curso de prueba todavía no tiene estudiantes activos.</p>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CwjnEIyP.js.map
