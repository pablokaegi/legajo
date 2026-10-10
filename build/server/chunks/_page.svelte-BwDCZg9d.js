import { h as head, e as escape_html, b as attr, s as stringify, a as ensure_array_like, c as attr_class, f as clsx$1, d as derived } from './dev-Dj5mSuMo.js';
import './client2-BLuH5cYu.js';
import { S as SelectorCategorias } from './SelectorCategorias-BLURhBvd.js';
import './internal-DGke0biV.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';
import './categorias-BK8Z_nGh.js';

//#region src/routes/gabinete/alumno/[alumnoId]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let l = derived(() => data.legajo);
		let abierto = derived(() => data.casos.find((c) => c.estado !== "cerrado"));
		let estadoNombre = derived(() => new Map(data.estados.map((e) => [e.id, e.nombre])));
		const fecha = (f) => {
			if (!f) return "—";
			const d = typeof f === "string" && /^\d{4}-\d{2}-\d{2}$/.test(f) ? /* @__PURE__ */ new Date(f + "T12:00:00") : new Date(f);
			return isNaN(d.getTime()) ? String(f) : d.toLocaleDateString("es-AR");
		};
		let ausencias = derived(() => l().faltas.filter((f) => f.tipo === "ausente").length);
		let retrasos = derived(() => l().faltas.filter((f) => f.tipo === "retraso").length);
		const GRAV = {
			leve: "text-amber-700",
			mediana: "text-orange-700",
			grave: "text-red-700"
		};
		head("mf0coj", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(l().alumnoNombre)} — Gabinete</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><a href="/gabinete" class="text-indigo-600 text-sm hover:underline">← Tablero</a> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="card space-y-1"><p class="text-lg font-bold text-gray-900">${escape_html(l().alumnoNombre)}</p> <div class="flex flex-wrap gap-3 text-xs text-gray-600"><span>📝 ${escape_html(l().observaciones.length)} observaciones</span> <span>🕒 ${escape_html(ausencias())} ausencias · ${escape_html(retrasos())} llegadas tarde</span> <span>⚠️ ${escape_html(l().amonestaciones.length)} amonestaciones</span> <span>📋 ${escape_html(l().actas.length)} actas</span></div> `);
		if (data.banco) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-xs text-gray-600">🪑 ${escape_html(data.banco.cursoNombre)}: banco ${escape_html(data.banco.banco)}${escape_html(data.banco.companeros.length ? ` con ${data.banco.companeros.map((c) => c.nombre).join(" y ")}` : "")}
        · <a${attr("href", `/aula/${stringify(data.banco.cursoMoodleId)}`)} class="text-indigo-700 hover:underline">ver plano</a></p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">📂 Casos</p> `);
		const each_array = ensure_array_like(data.casos);
		if (each_array.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let c = each_array[$$index];
				$$renderer.push(`<a${attr("href", `/gabinete/casos/${stringify(c.id)}`)} class="flex items-center justify-between rounded-lg border border-gray-200 p-2 hover:border-indigo-300"><span class="text-sm text-gray-800">Nivel ${escape_html(c.nivel)} · ${escape_html(estadoNombre().get(c.estado) ?? c.estado)}</span> <span class="text-xs text-gray-500">${escape_html(fecha(c.createdAt))}</span></a>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<p class="text-sm text-gray-500">Sin casos registrados.</p>`);
		}
		$$renderer.push(`<!--]--> `);
		if (!abierto()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<details><summary class="text-xs text-indigo-700 cursor-pointer">+ Abrir un caso</summary> <form method="POST" action="?/abrirCaso" class="mt-2 space-y-2">`);
			SelectorCategorias($$renderer, {});
			$$renderer.push(`<!----> <textarea name="motivo" rows="3" maxlength="5000" class="form-input text-sm" required="" placeholder="Qué se observó, desde cuándo, en qué contextos…"></textarea> <div class="flex items-center gap-2"><select name="nivel" class="form-input text-sm w-auto">`);
			$$renderer.option({
				value: "2",
				selected: true
			}, ($$renderer) => {
				$$renderer.push(`Nivel 2 — focalizado`);
			});
			$$renderer.option({ value: "3" }, ($$renderer) => {
				$$renderer.push(`Nivel 3 — intensivo`);
			});
			$$renderer.option({ value: "1" }, ($$renderer) => {
				$$renderer.push(`Nivel 1 — universal`);
			});
			$$renderer.push(`</select> <button type="submit" class="btn-primary text-sm">Abrir caso</button></div></form></details>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (data.agrupamientos.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">🧩 Vínculos y trabajo en grupo</p> <!--[-->`);
			const each_array_1 = ensure_array_like(data.agrupamientos);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let ag = each_array_1[$$index_1];
				$$renderer.push(`<div class="text-xs text-gray-700 border-l-2 border-gray-200 pl-2"><p><strong>${escape_html(ag.nombreAgrupacion)}</strong> · ${escape_html(ag.cursoNombre)} · ${escape_html(fecha(ag.fecha))}${escape_html(ag.rol ? ` · rol: ${ag.rol}` : "")}</p> <p>Con: ${escape_html(ag.companeros.map((c) => c.nombre).join(", ") || "—")}</p> `);
				if (ag.notaPedagogica.tipo === "acompanar") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-amber-700">Para acompañar: ${escape_html(ag.notaPedagogica.observaciones.join(" "))}</p>`);
				} else if (ag.notaPedagogica.tipo === "referente") {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`<p class="text-green-700">Referente: ${escape_html(ag.notaPedagogica.cualidades.join(" · "))}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (l().amonestaciones.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">⚠️ Amonestaciones recientes</p> <!--[-->`);
			const each_array_2 = ensure_array_like(l().amonestaciones.slice(0, 5));
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let a = each_array_2[$$index_2];
				$$renderer.push(`<p class="text-xs text-gray-700"><span${attr_class(clsx$1(GRAV[a.gravedad] ?? ""))}>${escape_html(a.gravedad)}</span> · ${escape_html(fecha(a.fecha))} — ${escape_html(a.motivo)}</p>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (l().observaciones.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card space-y-1.5"><p class="text-sm font-semibold text-gray-800">📝 Observaciones docentes recientes</p> <!--[-->`);
			const each_array_3 = ensure_array_like(l().observaciones.slice(0, 8));
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let o = each_array_3[$$index_3];
				$$renderer.push(`<p class="text-xs text-gray-700">${escape_html(fecha(o.fecha))} · ${escape_html(o.cursoNombre)} `);
				if (o.actitud != null) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`· actitud ${escape_html(o.actitud)}/5`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (o.participacion != null) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`· participación ${escape_html(o.participacion)}/5`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (o.observacionTexto) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`— ${escape_html(o.observacionTexto)}`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></p>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BwDCZg9d.js.map
