import { h as head, e as escape_html, b as attr, s as stringify, a as ensure_array_like, c as attr_class, d as derived } from './dev-BsmPEhme.js';
import './client2-Ds2pOMTK.js';
import './internal-Bh7K86Ic.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/gabinete/curso/[cursoId]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let nivelFiltro = 0;
		let cargandoNotas = false;
		let filas = derived(() => data.filas);
		let porNivel = derived(() => ({
			3: data.filas.filter((f) => f.nivel === 3).length,
			2: data.filas.filter((f) => f.nivel === 2).length,
			1: data.filas.filter((f) => f.nivel === 1).length
		}));
		const COLOR = {
			alerta: "bg-red-100 text-red-800",
			atencion: "bg-amber-100 text-amber-800",
			ok: "bg-green-50 text-green-700",
			sin_datos: "bg-gray-50 text-gray-400"
		};
		const ICONO = {
			alerta: "●",
			atencion: "◐",
			ok: "○",
			sin_datos: "–"
		};
		const NIVEL_CLS = {
			3: "bg-red-600 text-white",
			2: "bg-amber-500 text-white",
			1: "bg-green-600 text-white"
		};
		const AREAS = [
			["asistencia", "Asistencia"],
			["conducta", "Conducta"],
			["rendimiento", "Rendimiento"],
			["vinculos", "Vínculos"]
		];
		head("14i13nb", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Alerta temprana — ${escape_html(data.cursoNombre)}</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><a href="/gabinete" class="text-indigo-600 text-sm hover:underline">← Tablero</a> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="card space-y-1"><p class="text-sm font-semibold text-gray-800">🚦 ${escape_html(data.cursoNombre)}</p> <p class="text-xs text-gray-500">Cada área muestra qué se observó. Una sola señal es esperable; varias juntas indican que conviene
      intervenir. Los niveles siguen el modelo de apoyos escalonados (MTSS): 1 universal · 2 focalizado · 3 intensivo.</p> <div class="flex flex-wrap gap-2 pt-1"><a${attr("href", `/aula/${stringify(data.cursoId)}`)} class="text-xs text-indigo-700 hover:underline">🪑 Plano del aula</a> <a${attr("href", `/agrupamientos/curso/${stringify(data.cursoId)}`)} class="text-xs text-indigo-700 hover:underline">📈 Evolución de vínculos</a></div></div> <div class="flex flex-wrap items-center gap-2"><!--[-->`);
		const each_array = ensure_array_like([
			[0, "Todos"],
			[3, `Nivel 3 (${porNivel()[3]})`],
			[2, `Nivel 2 (${porNivel()[2]})`],
			[1, `Nivel 1 (${porNivel()[1]})`]
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [n, lbl] = each_array[$$index];
			$$renderer.push(`<button${attr_class(`text-xs px-3 py-1.5 rounded-full ${stringify(nivelFiltro === n ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700")}`)}>${escape_html(lbl)}</button>`);
		}
		$$renderer.push(`<!--]--> `);
		if (!data.conNotas) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button${attr("disabled", cargandoNotas, true)} class="text-xs text-indigo-700 hover:underline ml-auto">${escape_html("📚 Sumar notas de Moodle (tarda unos segundos)")}</button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (!data.hayVotacion) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-xs text-gray-500">Este curso todavía no tiene una votación de agrupamientos: el área Vínculos queda sin datos.</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="space-y-2"><!--[-->`);
		const each_array_1 = ensure_array_like(filas());
		for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
			let f = each_array_1[$$index_2];
			$$renderer.push(`<div class="card space-y-2"><div class="flex items-center justify-between gap-2"><div class="flex items-center gap-2 min-w-0"><span${attr_class(`text-[11px] font-bold px-2 py-0.5 rounded-full ${stringify(NIVEL_CLS[f.nivel])}`)}>N${escape_html(f.nivel)}</span> <a${attr("href", `/gabinete/alumno/${stringify(f.id)}`)} class="text-sm font-semibold text-gray-900 truncate hover:text-indigo-700">${escape_html(f.nombre)}</a></div> `);
			if (f.casoId) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<a${attr("href", `/gabinete/casos/${stringify(f.casoId)}`)} class="text-xs text-indigo-700 hover:underline flex-shrink-0">📂 Ver caso</a>`);
			} else if (f.nivel >= 2) {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<form method="POST" action="?/abrirCaso"><input type="hidden" name="alumnoId"${attr("value", f.id)}/> <button type="submit" class="text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100">+ Abrir caso</button></form>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5"><!--[-->`);
			const each_array_2 = ensure_array_like(AREAS);
			for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
				let [clave, titulo] = each_array_2[$$index_1];
				const ind = f[clave];
				$$renderer.push(`<div${attr_class(`rounded-lg px-2 py-1.5 ${stringify(COLOR[ind.nivel])}`)}${attr("title", ind.detalle)}><p class="text-[11px] font-semibold">${escape_html(ICONO[ind.nivel])} ${escape_html(titulo)}</p> <p class="text-[11px] leading-snug">${escape_html(ind.detalle)}</p></div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]--></div> <details class="card text-xs text-gray-600"><summary class="cursor-pointer text-sm font-semibold text-gray-800">¿Cómo se calcula?</summary> <ul class="mt-2 space-y-1"><li>• <strong>Asistencia:</strong> ${escape_html(data.umbrales.ausenciasAtencion)}+ ausencias en 30 días = atención (≈10 % de los días, umbral de
        ausentismo crónico — Balfanz &amp; Byrnes, 2012); ${escape_html(data.umbrales.ausenciasAlerta)}+ = alerta.</li> <li>• <strong>Conducta:</strong> 1 amonestación en 60 días o actitud observada baja = atención; una grave o 3+ = alerta.</li> <li>• <strong>Rendimiento:</strong> nota de Moodle &lt; ${escape_html(data.umbrales.notaAtencion)} = atención, &lt; ${escape_html(data.umbrales.notaAlerta)} = alerta; también
        tareas completas &lt; 50 % o participación baja en las observaciones.</li> <li>• <strong>Vínculos:</strong> sin elecciones en la última votación, o poco elegido en 2 de las últimas 3 = alerta.</li> <li>• <strong>Nivel:</strong> alerta suma 2 y atención 1; 2+ puntos = nivel 2, 4+ = nivel 3. El riesgo se acumula entre áreas
        (Allensworth &amp; Easton, 2007).</li></ul> <p class="mt-2">Es una herramienta de detección, no un diagnóstico: siempre confirmar con el equipo docente y el alumno.</p></details></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-D_ntdMKy.js.map
