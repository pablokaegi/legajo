import { h as head, e as escape_html, d as ensure_array_like, a as attr, b as attr_class, f as derived } from './dev-CsaMOlNk.js';
import './client2-i6F8J7u1.js';
import { N as NOMBRES_APOYO_ORAL, E as ESTADOS_ORAL, n as notaOral, a as NIVELES_ORAL, A as APOYOS_ORAL } from './20-BEAMD9Oz.js';
import './internal-BSUXWn6e.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';
import './shared-server-asDUS7ug.js';
import './db-CLN6I8p_.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './authz-BVdVv-6k.js';
import 'drizzle-orm';
import './audit-Dz9I-BN1.js';
import './aulaPiloto-DLB6Zm9h.js';
import './aula-rest-Gaa3l_kU.js';
import './rest-qugARKMk.js';
import 'zod';
import '@sveltejs/kit';
import 'node:crypto';

//#region src/routes/aula/oral/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let seleccionado = null;
		let ocupado = false;
		let estado = "evaluado";
		let rubrica = {
			caudales: null,
			unidades: null,
			justificacion: null
		};
		let devolucion = "";
		let apoyo = "";
		let revisarRubrica = false;
		const alumno = derived(() => data.alumnos.find((fila) => fila.id === seleccionado) ?? data.alumnos[0]);
		const nota = derived(() => notaOral(rubrica) );
		const progreso = derived(() => data.alumnos.filter(({ oral }) => oral?.nota != null || oral?.estado === "ausente").length);
		const enviados = derived(() => data.alumnos.filter(({ oral }) => oral?.publicacion === "verificado").length);
		const lote = derived(() => data.alumnos.flatMap(({ id, nombre, oral }) => oral?.nota != null && oral.publicacion !== "verificado" ? [{
			id,
			nombre,
			oral
		}] : []));
		const sucio = derived(() => !!alumno() && (estado !== (alumno().oral?.estado ?? "evaluado") || rubrica.caudales !== (alumno().oral?.caudales ?? null) || rubrica.unidades !== (alumno().oral?.unidades ?? null) || rubrica.justificacion !== (alumno().oral?.justificacion ?? null) || devolucion !== (alumno().oral?.devolucion ?? "") || apoyo !== (alumno().oral?.apoyo ?? "") || revisarRubrica));
		function etiqueta(oral) {
			if (!oral) return "Pendiente";
			if (oral.publicacion === "verificado") return "Verificada en Moodle";
			if (oral.publicacion === "conflicto") return "Revisar en Moodle";
			if (oral.publicacion === "error") return "Reintentar verificación";
			if (oral.publicacion) return "En cola";
			if (oral.estado !== "evaluado") return ESTADOS_ORAL[oral.estado];
			return oral.nota == null ? "Borrador" : "Lista para publicar";
		}
		head("jcitft", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Aula en Legajo · Oral de Ciencias</title>`);
			});
		});
		$$renderer.push(`<div class="aula-oral svelte-jcitft"><header class="svelte-jcitft"><div class="contexto svelte-jcitft">Aula en Legajo · Piloto con datos ficticios</div> <h1 class="svelte-jcitft">Oral de Ciencias</h1> <p class="bajada svelte-jcitft">Registrá la rúbrica en clase. Confirmá las notas para enviarlas a Moodle de prueba.</p></header> <details class="card preparacion svelte-jcitft"><summary class="svelte-jcitft">Preparar la actividad <span class="svelte-jcitft">${escape_html(data.actividad.titulo)}</span></summary> <div class="consigna svelte-jcitft"><p class="svelte-jcitft"><strong class="svelte-jcitft">Objetivo.</strong> ${escape_html(data.actividad.objetivo)}</p> <p class="svelte-jcitft"><strong class="svelte-jcitft">Consigna.</strong> ${escape_html(data.actividad.consigna)}</p> <p class="svelte-jcitft"><strong class="svelte-jcitft">Escala.</strong> Los tres criterios tienen el mismo peso. Evaluá lo que demuestra al hablar, escribir o usar su comunicador. Una rúbrica completa se convierte a una nota de 0 a 10.</p></div></details> <div class="resumen svelte-jcitft" aria-label="Avance de la clase"><span class="svelte-jcitft"><strong class="svelte-jcitft">${escape_html(progreso())}/${escape_html(data.alumnos.length)}</strong> estudiantes registrados</span> <span class="svelte-jcitft"><strong class="svelte-jcitft">${escape_html(enviados())}</strong> notas verificadas en Moodle</span></div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p role="alert" class="mensaje error svelte-jcitft">${escape_html(form.error)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.envio) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p role="status" class="mensaje svelte-jcitft">${escape_html(form.envio.verificados)} notas verificadas en Moodle. ${escape_html(form.envio.restantes)} requieren revisión o reintento.</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (alumno()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="estacion svelte-jcitft"><aside class="card padron svelte-jcitft" aria-labelledby="titulo-padron"><h2 id="titulo-padron" class="svelte-jcitft">Estudiantes</h2> <ul class="svelte-jcitft"><!--[-->`);
			const each_array = ensure_array_like(data.alumnos);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let fila = each_array[$$index];
				$$renderer.push(`<li class="svelte-jcitft"><button type="button"${attr("aria-pressed", alumno().id === fila.id)}${attr("disabled", ocupado, true)}${attr_class("svelte-jcitft", void 0, { "seleccionado": alumno().id === fila.id })}><span class="svelte-jcitft">${escape_html(fila.nombre)}</span><small class="svelte-jcitft">${escape_html(etiqueta(fila.oral))}</small></button></li>`);
			}
			$$renderer.push(`<!--]--></ul></aside> <form class="card evaluacion svelte-jcitft" action="?/guardar" method="POST"><div class="cabecera-evaluacion svelte-jcitft"><div class="svelte-jcitft"><p class="contexto svelte-jcitft">Rúbrica individual</p><h2 class="svelte-jcitft">${escape_html(alumno().nombre)}</h2></div> `);
			if (nota() !== null) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<output class="nota svelte-jcitft">${escape_html(nota().toLocaleString("es-AR", { maximumFractionDigits: 2 }))} / 10</output>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> `);
			if (alumno().oral?.detalle) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="mensaje error svelte-jcitft">${escape_html(alumno().oral.detalle)}</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <input type="hidden" name="alumnoId"${attr("value", alumno().id)} class="svelte-jcitft"/> <input type="hidden" name="revision"${attr("value", alumno().oral?.revision ?? 0)} class="svelte-jcitft"/> <fieldset${attr("disabled", ocupado, true)} class="svelte-jcitft"><legend class="svelte-jcitft">Estado del registro</legend> <div class="opciones svelte-jcitft"><!--[-->`);
			const each_array_1 = ensure_array_like(Object.entries(ESTADOS_ORAL));
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let [clave, nombre] = each_array_1[$$index_1];
				$$renderer.push(`<label class="svelte-jcitft"><input type="radio" name="estado"${attr("value", clave)}${attr("checked", estado === clave, true)} class="svelte-jcitft"/><span class="svelte-jcitft">${escape_html(nombre)}</span></label>`);
			}
			$$renderer.push(`<!--]--></div></fieldset> `);
			{
				$$renderer.push("<!--[0-->");
				if (alumno().oral && alumno().oral.versionRubrica < 2 && [
					alumno().oral.caudales,
					alumno().oral.unidades,
					alumno().oral.justificacion
				].some((nivel) => nivel !== null)) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="mensaje historica svelte-jcitft"><p class="svelte-jcitft">Los puntos guardados corresponden a la rúbrica anterior. Para cambiar un puntaje, volvé a observar la respuesta con los criterios de abajo.</p> <label class="svelte-jcitft"><input type="checkbox" name="revisarRubrica" value="si"${attr("checked", revisarRubrica, true)}${attr("disabled", ocupado, true)} class="svelte-jcitft"/> Revisé los criterios puntuados con esta rúbrica.</label></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <!--[-->`);
				const each_array_2 = ensure_array_like(data.actividad.criterios);
				for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
					let criterio = each_array_2[$$index_3];
					$$renderer.push(`<fieldset class="criterio svelte-jcitft"${attr("disabled", ocupado, true)}><legend class="svelte-jcitft">${escape_html(criterio.nombre)}</legend> <div class="opciones descriptores svelte-jcitft"><!--[-->`);
					const each_array_3 = ensure_array_like(NIVELES_ORAL);
					for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
						let nivel = each_array_3[$$index_2];
						$$renderer.push(`<label class="svelte-jcitft"><input type="radio"${attr("name", criterio.id)}${attr("value", nivel)}${attr("checked", rubrica[criterio.id] === nivel, true)} class="svelte-jcitft"/><span class="svelte-jcitft"><strong class="svelte-jcitft">${escape_html(nivel)} ${escape_html(nivel === 1 ? "punto" : "puntos")}</strong> ${escape_html(criterio.niveles[nivel])}</span></label>`);
					}
					$$renderer.push(`<!--]--></div> `);
					if (rubrica[criterio.id] !== null) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<button class="quitar svelte-jcitft" type="button">Dejar sin observar</button>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<small class="svelte-jcitft">Sin observar</small>`);
					}
					$$renderer.push(`<!--]--></fieldset>`);
				}
				$$renderer.push(`<!--]--> <label class="devolucion svelte-jcitft">Apoyo utilizado <small class="svelte-jcitft">Opcional. Se guarda en Legajo. La nota depende de los tres criterios.</small> `);
				$$renderer.select({
					name: "apoyo",
					value: apoyo,
					disabled: ocupado,
					class: ""
				}, ($$renderer) => {
					$$renderer.option({
						value: "",
						class: ""
					}, ($$renderer) => {
						$$renderer.push(`Sin registrar`);
					}, "svelte-jcitft");
					$$renderer.push(`<!--[-->`);
					const each_array_4 = ensure_array_like(APOYOS_ORAL);
					for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
						let codigo = each_array_4[$$index_4];
						$$renderer.option({
							value: codigo,
							class: ""
						}, ($$renderer) => {
							$$renderer.push(`${escape_html(NOMBRES_APOYO_ORAL[codigo])}`);
						}, "svelte-jcitft");
					}
					$$renderer.push(`<!--]-->`);
				}, "svelte-jcitft");
				$$renderer.push(`</label> <input type="hidden" name="apoyoAnterior"${attr("value", alumno().oral?.apoyo ?? "")} class="svelte-jcitft"/> <label class="devolucion svelte-jcitft">Devolución para el estudiante <small class="svelte-jcitft">Opcional. Se comparte en Moodle al publicar.</small> <textarea name="devolucion" rows="2" maxlength="500" placeholder="Una próxima acción concreta"${attr("disabled", ocupado, true)} class="svelte-jcitft">`);
				const $$body = escape_html(devolucion);
				if ($$body) $$renderer.push(`${$$body}`);
				$$renderer.push(`</textarea></label>`);
			}
			$$renderer.push(`<!--]--> <div class="acciones svelte-jcitft"><button class="principal svelte-jcitft" type="submit" value="siguiente"${attr("disabled", ocupado, true)}>Guardar y seguir</button> <button class="secundario svelte-jcitft" type="submit"${attr("disabled", ocupado, true)}>Guardar</button> `);
			if (sucio()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button type="button" class="texto svelte-jcitft"${attr("disabled", ocupado, true)}>Descartar cambios</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></form></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="mensaje svelte-jcitft">El curso de prueba todavía no tiene estudiantes activos.</p>`);
		}
		$$renderer.push(`<!--]--> <section class="card publicar svelte-jcitft" aria-labelledby="titulo-publicar"><h2 id="titulo-publicar" class="svelte-jcitft">Publicar en Moodle de prueba</h2> <p class="svelte-jcitft">Destino: <strong class="svelte-jcitft">${escape_html(data.tarea.nombre)}</strong>. Solo se incluyen rúbricas completas.</p> `);
		if (lote().length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button class="principal svelte-jcitft" type="button"${attr("disabled", sucio(), true)}>Revisar ${escape_html(lote().length)} ${escape_html(lote().length === 1 ? "nota" : "notas")}</button>`);
			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="svelte-jcitft">Por ahora no hay notas pendientes de publicación.</p>`);
		}
		$$renderer.push(`<!--]--></section></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-FOiD--Gz.js.map
