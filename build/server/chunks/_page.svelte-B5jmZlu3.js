import { h as head, a as ensure_array_like, b as attr, c as attr_class, s as stringify, e as escape_html, f as clsx$1, d as derived } from './dev-Dj5mSuMo.js';
import { p as parseCategorias, a as CATEGORIA_POR_ID } from './categorias-BK8Z_nGh.js';

//#region src/routes/gabinete/casos/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let estadoNombre = derived(() => new Map(data.estados.map((e) => [e.id, e.nombre])));
		const hoy = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const fmt = (f) => f ? (/* @__PURE__ */ new Date(f + "T12:00:00")).toLocaleDateString("es-AR") : "—";
		const NIVEL_CLS = {
			3: "bg-red-600 text-white",
			2: "bg-amber-500 text-white",
			1: "bg-green-600 text-white"
		};
		const href = (estado, nivel) => `?estado=${estado}${nivel ? `&nivel=${nivel}` : ""}`;
		head("1y1c9qs", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Casos — Gabinete</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-3"><div class="flex flex-wrap gap-1.5"><!--[-->`);
		const each_array = ensure_array_like([
			["abiertos", "Abiertos"],
			...data.estados.map((e) => [e.id, e.nombre]),
			["todos", "Todos"]
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [id, nombre] = each_array[$$index];
			$$renderer.push(`<a${attr("href", href(id, data.nivel))}${attr_class(`text-xs px-3 py-1.5 rounded-full ${stringify(data.estado === id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700")}`)}>${escape_html(nombre)}</a>`);
		}
		$$renderer.push(`<!--]--></div> <div class="flex flex-wrap gap-1.5"><!--[-->`);
		const each_array_1 = ensure_array_like([
			0,
			3,
			2,
			1
		]);
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let n = each_array_1[$$index_1];
			$$renderer.push(`<a${attr("href", href(data.estado, n))}${attr_class(`text-xs px-3 py-1 rounded-full ${stringify(data.nivel === n ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700")}`)}>${escape_html(n ? `Nivel ${n}` : "Todos los niveles")}</a>`);
		}
		$$renderer.push(`<!--]--></div> `);
		const each_array_2 = ensure_array_like(data.casos);
		if (each_array_2.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
				let c = each_array_2[$$index_3];
				$$renderer.push(`<a${attr("href", `/gabinete/casos/${stringify(c.id)}`)} class="card block hover:border-indigo-300 space-y-1"><div class="flex items-center justify-between gap-2"><p class="text-sm font-semibold text-gray-900 truncate"><span${attr_class(`text-[11px] font-bold px-2 py-0.5 rounded-full ${stringify(NIVEL_CLS[c.nivel] ?? "")}`)}>N${escape_html(c.nivel)}</span> ${escape_html(c.alumnoNombre)}</p> <span class="text-xs text-gray-500 flex-shrink-0">${escape_html(estadoNombre().get(c.estado) ?? c.estado)}</span></div> <p class="text-xs text-gray-500">${escape_html(c.cursoNombre ?? "sin curso")} · ${escape_html(c.responsable ? `responsable: ${c.responsable}` : "sin responsable")} `);
				if (c.estado !== "cerrado") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`· <span${attr_class(clsx$1(c.proximaRevision && c.proximaRevision < hoy ? "text-red-600 font-medium" : ""))}>revisión ${escape_html(fmt(c.proximaRevision))}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></p> `);
				if (parseCategorias(c.categoriasJson).length) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="flex flex-wrap gap-1"><!--[-->`);
					const each_array_3 = ensure_array_like(parseCategorias(c.categoriasJson));
					for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
						let id = each_array_3[$$index_2];
						const cat = CATEGORIA_POR_ID.get(id);
						$$renderer.push(`<span class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">${escape_html(cat?.urgente ? "⚠️ " : "")}${escape_html(cat?.nombre)}</span>`);
					}
					$$renderer.push(`<!--]--></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></a>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<div class="card text-center py-8 text-sm text-gray-500">No hay casos con ese filtro.</div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-B5jmZlu3.js.map
