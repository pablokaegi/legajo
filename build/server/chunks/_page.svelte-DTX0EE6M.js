import { h as head, b as attr, a as ensure_array_like, c as attr_class, e as escape_html, d as derived } from './index.js-D6_LEqEo.js';
import { z } from 'zod';
import '@sveltejs/kit/internal';
import '@sveltejs/kit';
import '@sveltejs/kit/internal/server';

// src/lib/laboratorio/apoyos.ts
var pasoSchema = z.object({
	id: z.string().min(1),
	titulo: z.string().max(120),
	consigna: z.string().max(1400),
	audio: z.string().max(1400)
});
var actividadSchema = z.object({
	titulo: z.string().max(120),
	objetivo: z.string().max(500),
	moodleUrl: z.string().max(2048),
	pasos: z.array(pasoSchema).min(1).max(8)
}).refine((actividad) => new Set(actividad.pasos.map((paso) => paso.id)).size === actividad.pasos.length);
var apoyoSchema = z.object({
	barrera: z.string().max(500),
	ajuste: z.string().max(500),
	responsable: z.string().max(120),
	revision: z.string(),
	ofrecido: z.enum([
		"pendiente",
		"si",
		"no"
	]),
	observacion: z.string().max(500),
	decision: z.enum([
		"pendiente",
		"mantener",
		"ajustar",
		"cerrar"
	])
});
z.object({
	version: z.literal(1),
	actividad: actividadSchema,
	apoyo: apoyoSchema,
	completados: z.array(z.string()).max(8),
	pasoActivo: z.string().nullable()
});
function demoInicial() {
	return {
		version: 1,
		actividad: {
			titulo: "¿Qué canilla consume más agua?",
			objetivo: "Comparar el consumo por minuto y justificar una decisión con los datos.",
			moodleUrl: "",
			pasos: [
				{
					id: "leer",
					titulo: "Leé los datos",
					consigna: "Canilla A: se juntaron 12 litros en 3 minutos.\nCanilla B: se juntaron 18 litros en 3 minutos.\nAnotá el volumen y el tiempo de cada canilla.",
					audio: "Los datos son ficticios. En la canilla A se juntaron doce litros en tres minutos. En la canilla B se juntaron dieciocho litros en tres minutos. Anotá el volumen y el tiempo de cada canilla."
				},
				{
					id: "comparar",
					titulo: "Calculá y compará",
					consigna: "Dividí los litros de cada canilla por sus minutos.\nEjemplo de inicio: para la canilla A, escribí 12 ÷ 3.\nCompará los dos resultados en litros por minuto.",
					audio: "Dividí los litros de cada canilla por sus minutos. Para la canilla A, empezá con doce dividido tres. Luego compará ambos resultados en litros por minuto."
				},
				{
					id: "justificar",
					titulo: "Justificá tu decisión",
					consigna: "¿Qué canilla revisarías primero? Usá los dos resultados para explicar por qué.\nMencioná una condición que debería ser comparable al medir, como la apertura de la canilla.\nPrepará una respuesta breve en texto o audio.",
					audio: "Decidí qué canilla revisarías primero y explicá por qué con ambos resultados. Nombrá una condición de medición que convenga mantener comparable."
				}
			]
		},
		apoyo: {
			barrera: "En el ejemplo ficticio, una consigna larga dificulta identificar cómo empezar.",
			ajuste: "Mostrar una consigna por paso, ofrecer audio opcional y dejar visible un ejemplo de inicio.",
			responsable: "Docente de Ciencias · cuenta ficticia",
			revision: "",
			ofrecido: "pendiente",
			observacion: "",
			decision: "pendiente"
		},
		completados: [],
		pasoActivo: "leer"
	};
}
// src/routes/laboratorio/apoyos/+page.svelte
function _page($$renderer, $$props) {
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
		head("1evdr4t", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Laboratorio de apoyos · Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="laboratorio svelte-1evdr4t"${attr("data-ready", listo)}><header class="encabezado svelte-1evdr4t"><p class="marca svelte-1evdr4t">Legajo / Ciencias</p> <h1 class="svelte-1evdr4t">Laboratorio de apoyos</h1> <p>Demo ficticia. Los cambios y el progreso se guardan en este navegador.</p></header> <nav aria-label="Vistas del laboratorio" class="svelte-1evdr4t"><!--[-->`);
		const each_array = ensure_array_like(vistas);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let opcion = each_array[$$index];
			$$renderer.push(`<button type="button"${attr("aria-pressed", vista === opcion.id)}${attr_class("svelte-1evdr4t", void 0, { "seleccionado": vista === opcion.id })}>${escape_html(opcion.nombre)}</button>`);
		}
		$$renderer.push(`<!--]--></nav> `);
		{
			$$renderer.push(`<!--[0--><form class="panel svelte-1evdr4t"><h2 class="svelte-1evdr4t">Prepará la actividad</h2> <div class="campos svelte-1evdr4t"><label class="svelte-1evdr4t">Título <input${attr("value", demo.actividad.titulo)} required="" maxlength="120" class="svelte-1evdr4t"/></label> <label class="svelte-1evdr4t">Objetivo <textarea required="" maxlength="500" rows="2" class="svelte-1evdr4t">`);
			const $$body = escape_html(demo.actividad.objetivo);
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea></label> <label class="svelte-1evdr4t">Enlace a la actividad en Moodle (opcional) <input type="url"${attr("value", demo.actividad.moodleUrl)} maxlength="2048" placeholder="https://…" class="svelte-1evdr4t"/></label></div> <!--[-->`);
			const each_array_1 = ensure_array_like(demo.actividad.pasos);
			for (let indice = 0, $$length = each_array_1.length; indice < $$length; indice++) {
				let item = each_array_1[indice];
				$$renderer.push(`<fieldset class="svelte-1evdr4t"><legend class="svelte-1evdr4t">Paso ${escape_html(indice + 1)}</legend> <div class="campos svelte-1evdr4t"><label class="svelte-1evdr4t">Título del paso <input${attr("value", item.titulo)} required="" maxlength="120" class="svelte-1evdr4t"/></label> <label class="svelte-1evdr4t">Consigna <textarea required="" maxlength="1400" rows="3" class="svelte-1evdr4t">`);
				const $$body_1 = escape_html(item.consigna);
				if ($$body_1) $$renderer.push(`${$$body_1}`);
				$$renderer.push(`</textarea></label> <label class="svelte-1evdr4t">Guion para escuchar (opcional) <textarea maxlength="1400" rows="2" class="svelte-1evdr4t">`);
				const $$body_2 = escape_html(item.audio);
				if ($$body_2) $$renderer.push(`${$$body_2}`);
				$$renderer.push(`</textarea></label></div> <div class="acciones svelte-1evdr4t"><button type="button"${attr("disabled", indice === 0, true)} class="svelte-1evdr4t">Subir paso</button> <button type="button"${attr("disabled", indice === total() - 1, true)} class="svelte-1evdr4t">Bajar paso</button> <button type="button"${attr("disabled", total() === 1, true)} class="svelte-1evdr4t">Quitar paso</button></div></fieldset>`);
			}
			$$renderer.push(`<!--]--> <div class="acciones svelte-1evdr4t"><button type="button"${attr("disabled", total() >= 8, true)} class="svelte-1evdr4t">Agregar paso</button> <button type="button" class="svelte-1evdr4t">Descargar HTML para Moodle</button> <button type="submit" class="principal svelte-1evdr4t">Guardar actividad</button></div></form>`);
		}
		$$renderer.push(`<!--]--> <p class="estado svelte-1evdr4t" role="status">${escape_html(aviso)}</p></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DTX0EE6M.js.map
