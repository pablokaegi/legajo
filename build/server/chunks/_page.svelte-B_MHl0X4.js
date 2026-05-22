import { h as head, e as escape_html, c as attr_class, s as stringify, b as attr, i as attr_style, a as ensure_array_like, d as derived } from './dev-BsmPEhme.js';
import { p as page } from './state-pubHHBfT.js';
import './client2-CHMUHMSV.js';
import './internal-UDJZP-q0.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/institucional/agrupamientos/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let sesion = derived(() => data.sesion);
		let roster = derived(() => data.roster);
		let votos = derived(() => data.votos);
		let cerrada = derived(() => sesion().estado === "cerrada");
		let votanteSet = derived(() => new Set(votos().map((v) => v.votanteMoodleId)));
		let pendientes = derived(() => roster().filter((a) => !votanteSet().has(a.id)));
		let progreso = derived(() => roster().length ? Math.round(votos().length / roster().length * 100) : 0);
		let linkPublico = derived(() => sesion().votoToken ? `${page.url.origin}/votar/${sesion().votoToken}` : "");
		function iniciales(n) {
			return n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
		}
		head("t0pe5j", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(sesion().titulo)} — Agrupamientos</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><a href="/institucional/agrupamientos" class="text-indigo-600 text-sm hover:underline">← Agrupamientos</a> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.generados !== void 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">Se generaron ${escape_html(form.generados)} voto(s) aleatorio(s).</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="card space-y-2">`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<div class="flex items-start justify-between gap-2"><div class="min-w-0"><h2 class="text-lg font-bold text-gray-900">${escape_html(sesion().titulo)}</h2> <p class="text-xs text-gray-500">🎓 ${escape_html(sesion().cursoNombre)} · 📅 ${escape_html(sesion().fecha)}</p> <p class="text-xs text-gray-500">Cada alumno evalúa a ${escape_html(sesion().cantidadEvaluar)} compañeros</p></div> <span${attr_class(`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${stringify(cerrada() ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700")}`)}>${escape_html(sesion().estado)}</span></div> `);
		if (sesion().notas) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm text-gray-600 whitespace-pre-line">${escape_html(sesion().notas)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="flex flex-wrap gap-3 pt-1"><button class="text-xs text-indigo-600 hover:underline">✏️ Editar</button> <form method="POST" action="?/cambiarEstado"><input type="hidden" name="estado"${attr("value", cerrada() ? "abierta" : "cerrada")}/> <button type="submit" class="text-xs text-gray-600 hover:underline">${escape_html(cerrada() ? "🔓 Reabrir votación" : "🔒 Cerrar votación")}</button></form> <button class="text-xs text-red-500 hover:underline">🗑 Eliminar sesión</button></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		$$renderer.push(`<!--]--></div> <div class="card space-y-2"><div class="flex items-center justify-between"><p class="text-sm font-semibold text-gray-800">Votación</p> <span class="text-sm text-gray-500">${escape_html(votos().length)} de ${escape_html(roster().length)}</span></div> <div class="h-2 bg-gray-100 rounded-full overflow-hidden"><div class="h-full bg-indigo-600 transition-all"${attr_style(`width: ${stringify(progreso())}%`)}></div></div> <a${attr("href", `/institucional/agrupamientos/${stringify(sesion().id)}/votar`)}${attr_class(`btn-primary w-full text-sm text-center block ${stringify(cerrada() ? "opacity-50 pointer-events-none" : "")}`)}>🗳️ Abrir votación</a> <p class="text-xs text-gray-500">Abrí esto en la compu/tablet del aula y los alumnos pasan de a uno a votar.</p></div> <div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">📱 Link para votar desde el celular <span class="text-gray-400 font-normal">(opcional)</span></p> `);
		if (linkPublico()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 break-all">${escape_html(linkPublico())}</div> <div class="flex gap-2"><button class="btn-primary text-sm flex-1">${escape_html("🔗 Copiar link")}</button> <form method="POST" action="?/quitarToken"><button type="submit" class="text-sm text-red-500 px-3 py-2 hover:underline">Desactivar</button></form></div> <p class="text-xs text-gray-500">Cualquiera con el link puede entrar y votar eligiendo su nombre. Compartilo solo con el curso.</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<form method="POST" action="?/generarToken"><button type="submit" class="text-sm text-indigo-600 hover:underline">+ Generar link público</button></form>`);
		}
		$$renderer.push(`<!--]--></div> <div class="grid grid-cols-2 gap-2"><a${attr("href", `/institucional/agrupamientos/${stringify(sesion().id)}/resultados`)}${attr_class(`card text-center hover:border-indigo-300 transition-colors ${stringify(votos().length < 2 ? "opacity-50 pointer-events-none" : "")}`)}><p class="text-2xl">🧩</p> <p class="text-sm font-semibold text-gray-800">Armar grupos</p></a> <a${attr("href", `/institucional/agrupamientos/${stringify(sesion().id)}/estadisticas`)}${attr_class(`card text-center hover:border-indigo-300 transition-colors ${stringify(votos().length < 1 ? "opacity-50 pointer-events-none" : "")}`)}><p class="text-2xl">📊</p> <p class="text-sm font-semibold text-gray-800">Estadísticas</p></a></div> <div class="card space-y-2"><div class="flex items-center justify-between"><p class="text-sm font-semibold text-gray-800">Votos cargados</p> `);
		if (votos().length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<form method="POST" action="?/vaciarVotos"><button type="submit" class="text-xs text-red-500 hover:underline">Vaciar todos</button></form>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (votos().length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm text-gray-500">Todavía no votó nadie.</p> <form method="POST" action="?/generarAleatorio"><button type="submit" class="text-xs text-indigo-600 hover:underline">⚡ Generar votación aleatoria (para probar / modo rápido)</button></form>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-1"><!--[-->`);
			const each_array = ensure_array_like(votos());
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let v = each_array[$$index];
				$$renderer.push(`<div class="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-gray-50"><div class="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">${escape_html(iniciales(v.votanteNombre))}</div> <span class="flex-1 text-sm text-gray-800 truncate">${escape_html(v.votanteNombre)}</span> `);
				if (v.bloqueadoNombre) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="text-xs text-red-500">🚫 ${escape_html(v.bloqueadoNombre)}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <form method="POST" action="?/eliminarVoto"><input type="hidden" name="votoId"${attr("value", v.id)}/> <button type="submit" class="text-xs text-gray-400 hover:text-red-500" title="Borrar este voto">✕</button></form></div>`);
			}
			$$renderer.push(`<!--]--></div> `);
			if (pendientes().length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-xs text-gray-500 pt-1">Faltan ${escape_html(pendientes().length)}: ${escape_html(pendientes().map((a) => a.nombre).join(", "))}</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-B_MHl0X4.js.map
