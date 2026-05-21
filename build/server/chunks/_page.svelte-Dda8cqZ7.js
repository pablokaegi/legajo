import { h as head, e as escape_html, c as attr_class, s as stringify, b as attr, a as ensure_array_like, d as derived } from './dev-BsmPEhme.js';
import './client2-3UesqteX.js';
import './internal-Nojd8QRY.js';
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
		let votoPorVotante = derived(() => new Map(votos().map((v) => [v.votanteMoodleId, v])));
		let nombrePorId = derived(() => new Map(roster().map((a) => [a.id, a.nombre])));
		let votoActivo = null;
		let ratings = {};
		let bloqueado = null;
		let busqueda = "";
		let calificacionesPayload = derived(() => Object.entries(ratings).map(([id, p]) => ({
			id: Number(id),
			nombre: nombrePorId().get(Number(id)) ?? "",
			puntaje: p
		})));
		let cantRatings = derived(() => Object.keys(ratings).length);
		function companeros(votanteId) {
			const q = busqueda.trim().toLowerCase();
			return roster().filter((a) => a.id !== votanteId).filter((a) => !q || a.nombre.toLowerCase().includes(q));
		}
		function iniciales(nombre) {
			return nombre.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
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
		$$renderer.push(`<!--]--> <div class="card space-y-2">`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<div class="flex items-start justify-between gap-2"><div class="min-w-0"><h2 class="text-lg font-bold text-gray-900">${escape_html(sesion().titulo)}</h2> <p class="text-xs text-gray-500">🎓 ${escape_html(sesion().cursoNombre)} · 📅 ${escape_html(sesion().fecha)}</p></div> <span${attr_class(`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${stringify(cerrada() ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700")}`)}>${escape_html(sesion().estado)}</span></div> `);
		if (sesion().notas) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm text-gray-600 whitespace-pre-line">${escape_html(sesion().notas)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="flex flex-wrap gap-2 pt-1">`);
		if (!cerrada()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="text-xs text-indigo-600 hover:underline">✏️ Editar</button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <form method="POST" action="?/cambiarEstado"><input type="hidden" name="estado"${attr("value", cerrada() ? "abierta" : "cerrada")}/> <button type="submit" class="text-xs text-gray-600 hover:underline">${escape_html(cerrada() ? "🔓 Reabrir" : "🔒 Cerrar sesión")}</button></form> <button class="text-xs text-red-500 hover:underline">🗑 Eliminar</button></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		$$renderer.push(`<!--]--></div> <div class="card flex items-center justify-between gap-3"><div><p class="text-sm font-semibold text-gray-800">${escape_html(votos().length)} de ${escape_html(roster().length)} votos cargados</p> <p class="text-xs text-gray-500">Cargá las preferencias de cada alumno</p></div> <a${attr("href", `/institucional/agrupamientos/${stringify(sesion().id)}/resultados`)}${attr_class(`btn-primary text-sm whitespace-nowrap ${stringify(votos().length < 2 ? "opacity-50 pointer-events-none" : "")}`)}>Ver resultados →</a></div> `);
		if (roster().length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-8"><p class="text-2xl mb-2">⚠️</p> <p class="text-gray-500 text-sm">No se pudo cargar la lista de alumnos del curso desde Moodle.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-2"><!--[-->`);
			const each_array = ensure_array_like(roster());
			for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
				let alumno = each_array[$$index_2];
				const voto = votoPorVotante().get(alumno.id);
				const abierto = votoActivo === alumno.id;
				$$renderer.push(`<div${attr_class(`card ${stringify(abierto ? "border-indigo-400" : "")} space-y-0 p-0 overflow-hidden`)}><button${attr("disabled", cerrada(), true)}${attr_class(`w-full text-left flex items-center gap-3 p-3 transition-colors ${stringify(cerrada() ? "cursor-default" : "hover:bg-gray-50")}`)}><div${attr_class(`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${stringify(voto ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}`)}>${escape_html(iniciales(alumno.nombre))}</div> <div class="flex-1 min-w-0"><p class="text-sm font-medium text-gray-900 truncate">${escape_html(alumno.nombre)}</p> `);
				if (voto) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-xs text-green-600">✅ ${escape_html(voto.calificaciones.length)} calificación/es `);
					if (voto.bloqueadoNombre) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`· 🚫 bloqueó a ${escape_html(voto.bloqueadoNombre)}`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></p>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<p class="text-xs text-gray-400">⏳ Sin cargar</p>`);
				}
				$$renderer.push(`<!--]--></div> `);
				if (!cerrada()) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="text-xs text-indigo-600 flex-shrink-0">${escape_html(abierto ? "▲" : voto ? "Editar" : "Cargar")}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></button> `);
				if (abierto) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="border-t border-gray-200 bg-gray-50 p-3 space-y-3"><p class="text-xs text-gray-600">Calificá del 1 (poco) al 5 (mucho) a los compañeros con quienes <strong>${escape_html(alumno.nombre)}</strong> prefiere trabajar. Dejá en blanco los que no calificó.</p> <input type="search"${attr("value", busqueda)} placeholder="Buscar compañero..." class="form-input text-sm w-full"/> <div class="space-y-1 max-h-80 overflow-y-auto pr-1"><!--[-->`);
					const each_array_1 = ensure_array_like(companeros(alumno.id));
					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let comp = each_array_1[$$index_1];
						$$renderer.push(`<div${attr_class(`flex items-center gap-2 py-1.5 px-2 rounded-lg ${stringify(bloqueado === comp.id ? "bg-red-50" : ratings[comp.id] ? "bg-indigo-50" : "bg-white")}`)}><span class="flex-1 text-sm text-gray-800 truncate">${escape_html(comp.nombre)}</span> <div class="flex gap-0.5 flex-shrink-0"><!--[-->`);
						const each_array_2 = ensure_array_like([
							1,
							2,
							3,
							4,
							5
						]);
						for (let $$index = 0, $$length = each_array_2.length; $$index < $$length; $$index++) {
							let p = each_array_2[$$index];
							$$renderer.push(`<button type="button"${attr_class(`w-6 h-6 rounded text-xs font-semibold transition-colors ${stringify(ratings[comp.id] === p ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500 hover:bg-indigo-200")}`)}>${escape_html(p)}</button>`);
						}
						$$renderer.push(`<!--]--></div> <button type="button" title="Bloquear"${attr_class(`w-6 h-6 rounded text-xs flex-shrink-0 transition-colors ${stringify(bloqueado === comp.id ? "bg-red-600 text-white" : "bg-gray-200 text-gray-400 hover:bg-red-200")}`)}>🚫</button></div>`);
					}
					$$renderer.push(`<!--]--></div> <form method="POST" action="?/guardarVoto" class="space-y-2"><input type="hidden" name="votanteMoodleId"${attr("value", alumno.id)}/> <input type="hidden" name="votanteNombre"${attr("value", alumno.nombre)}/> <input type="hidden" name="calificaciones"${attr("value", JSON.stringify(calificacionesPayload()))}/> <input type="hidden" name="bloqueadoMoodleId"${attr("value", "")}/> <input type="hidden" name="bloqueadoNombre"${attr("value", "")}/> <div class="flex items-center justify-between gap-2"><span class="text-xs text-gray-500">${escape_html(cantRatings())} calificación/es${escape_html("")}</span> <div class="flex gap-2">`);
					if (voto) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<button type="submit" formaction="?/eliminarVoto" formnovalidate="" class="text-xs text-red-500 hover:underline px-2">Borrar voto</button> <input type="hidden" name="votoId"${attr("value", voto.id)}/>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> <button type="submit" class="btn-primary text-sm"${attr("disabled", cantRatings() === 0, true)}>${escape_html("Guardar voto")}</button></div></div></form></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Dda8cqZ7.js.map
