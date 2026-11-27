import { h as head, e as escape_html, d as ensure_array_like, a as attr, f as derived } from './dev-CsaMOlNk.js';

//#region src/routes/gabinete/aula-ciencias/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let conIntentos = derived(() => data.estudiantes.filter((e) => e.intentos.length));
		let sinIntentos = derived(() => data.estudiantes.filter((e) => !e.errorLectura && !e.intentos.length));
		let sinLectura = derived(() => data.estudiantes.filter((e) => e.errorLectura));
		const fecha = new Intl.DateTimeFormat("es-AR", {
			dateStyle: "short",
			timeStyle: "short",
			timeZone: "America/Argentina/Cordoba"
		});
		const numero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });
		head("1euiwa4", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Objetivos de Ciencias · Gabinete</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><header class="card flex flex-wrap items-start justify-between gap-4"><div><h2 class="text-xl font-semibold text-gray-900">Objetivos de Ciencias</h2> <p class="mt-1 text-sm text-gray-700">${escape_html(data.titulo)}</p> <p class="mt-1 text-sm text-gray-600">Práctica formativa · Resultados por intento desde Moodle de prueba</p></div> <form method="GET" data-sveltekit-reload=""><button class="btn-secondary min-h-11" type="submit">Actualizar resultados</button></form></header> <!--[-->`);
		const each_array = ensure_array_like(conIntentos());
		for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
			let estudiante = each_array[$$index_2];
			$$renderer.push(`<section class="card"><div class="flex flex-wrap items-baseline justify-between gap-2"><h3 class="font-semibold text-gray-900">${escape_html(estudiante.nombre)}</h3> <a class="text-sm font-medium text-indigo-700 underline"${attr("href", "/laboratorio/apoyos/fichas?alumnoId=" + estudiante.id)}${attr("aria-label", "Abrir ficha de apoyos de " + estudiante.nombre)}>Abrir ficha de apoyos</a></div> <!--[-->`);
			const each_array_1 = ensure_array_like(estudiante.intentos);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let intento = each_array_1[$$index_1];
				$$renderer.push(`<div class="mt-3 border-t border-gray-200 pt-3"><p class="text-sm text-gray-700">Intento ${escape_html(intento.numero)} · ${escape_html(intento.estado)} `);
				if (intento.fecha) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`· ${escape_html(fecha.format(intento.fecha * 1e3))}`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></p> `);
				if (intento.puntajes) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<dl class="mt-2 grid gap-2 sm:grid-cols-3"><!--[-->`);
					const each_array_2 = ensure_array_like(data.objetivos);
					for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
						let objetivo = each_array_2[i];
						const valor = intento.puntajes[i];
						$$renderer.push(`<div class="rounded-lg bg-gray-50 p-3"><dt class="text-sm font-medium text-gray-800">${escape_html(objetivo)}</dt> <dd class="mt-1 text-sm text-gray-700">`);
						if (valor === null) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`Pendiente de corrección`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`<strong>${escape_html(numero.format(valor))}/1</strong> ·
                      ${escape_html(valor === 1 ? "Logrado en este intento" : valor === 0 ? "Sin puntaje en este intento" : "Logro parcial")}`);
						}
						$$renderer.push(`<!--]--></dd></div>`);
					}
					$$renderer.push(`<!--]--></dl>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></section>`);
		}
		$$renderer.push(`<!--]--> `);
		if (sinIntentos().length) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section class="card"><h3 class="font-semibold text-gray-900">Sin intento (${escape_html(sinIntentos().length)})</h3> <p class="mt-1 text-sm text-gray-600">Todavía no hay evidencia del cuestionario para estos estudiantes.</p> <ul class="mt-2 grid gap-1 text-sm text-gray-700 sm:grid-cols-2"><!--[-->`);
			const each_array_3 = ensure_array_like(sinIntentos());
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let estudiante = each_array_3[$$index_3];
				$$renderer.push(`<li><a class="text-indigo-700 underline"${attr("href", "/laboratorio/apoyos/fichas?alumnoId=" + estudiante.id)}${attr("aria-label", "Abrir ficha de apoyos de " + estudiante.nombre)}>${escape_html(estudiante.nombre)}</a></li>`);
			}
			$$renderer.push(`<!--]--></ul></section>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (sinLectura().length) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section class="card border-amber-300"><h3 class="font-semibold text-amber-900">Lectura pendiente de verificar</h3> <p class="mt-1 text-sm text-gray-700">Actualizá los resultados para volver a consultar a Moodle.</p> <ul class="mt-2 text-sm text-gray-700"><!--[-->`);
			const each_array_4 = ensure_array_like(sinLectura());
			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let estudiante = each_array_4[$$index_4];
				$$renderer.push(`<li><a class="text-indigo-700 underline"${attr("href", "/laboratorio/apoyos/fichas?alumnoId=" + estudiante.id)}${attr("aria-label", "Abrir ficha de apoyos de " + estudiante.nombre)}>${escape_html(estudiante.nombre)}</a></li>`);
			}
			$$renderer.push(`<!--]--></ul></section>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (!data.estudiantes.length) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="card text-sm text-gray-700">El padrón del curso no tiene estudiantes activos.</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-C-5VcDq9.js.map
