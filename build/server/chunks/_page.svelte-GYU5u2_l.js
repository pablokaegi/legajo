import { h as head, e as escape_html, a as ensure_array_like, c as attr_class, b as attr, j as attr_style, s as stringify, o as onDestroy, d as derived } from './index.js-D6_LEqEo.js';
import { p as page } from './state-BtAJWp-X.js';
import './client2-D0o9x_5T.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit';
import '@sveltejs/kit/internal/server';

// src/lib/components/pizarra/AlumnoAlAzar.svelte
function AlumnoAlAzar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { roster } = $$props;
		(/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		let pasaron = [];
		let ausentes = [];
		let presentes = derived(() => roster.filter((a) => !ausentes.includes(a.id)));
		let disponibles = derived(() => presentes().filter((a) => !pasaron.includes(a.id)));
		$$renderer.push(`<div class="flex flex-col items-center gap-6 py-4"><div${attr_class(`w-full max-w-4xl min-h-48 rounded-3xl bg-white border-4 border-gray-200 flex items-center justify-center p-6`)}>`);
		$$renderer.push(`<!--[-1--><p class="text-3xl text-gray-400">Tocá “Elegir” 🎲</p>`);
		$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-3"><button${attr("disabled", presentes().length === 0, true)} class="px-12 py-6 rounded-2xl bg-indigo-600 text-white text-3xl font-bold active:bg-indigo-700 disabled:opacity-50">🎲 Elegir</button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <p class="text-xl text-gray-600">Faltan pasar <strong>${escape_html(disponibles().length)}</strong> de ${escape_html(presentes().length)} `);
		if (ausentes.length) $$renderer.push(`<!--[0--><span class="text-gray-400">· ${escape_html(ausentes.length)} no están hoy</span>`);
		else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></p> <div class="flex flex-wrap justify-center gap-3"><button class="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 text-lg">↺ Nueva ronda</button> <button class="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 text-lg">${escape_html("¿Quién no está hoy?")}</button></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}
// src/lib/components/pizarra/GruposPizarra.svelte
function GruposPizarra($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { agrupaciones, azar, azarTamano } = $$props;
		let elegida = null;
		let actual = derived(() => azar ?? null);
		let titulo = derived(() => azar ? `Grupos al azar de ${azarTamano}` : agrupaciones.find((a) => a.id === elegida)?.nombre ?? "");
		const COLORES = [
			"#4f46e5",
			"#0d9488",
			"#d97706",
			"#db2777",
			"#2563eb",
			"#16a34a",
			"#9333ea",
			"#dc2626"
		];
		if (!actual()) {
			$$renderer.push(`<!--[0--><div class="max-w-5xl mx-auto space-y-5 py-2"><div class="space-y-2"><p class="text-2xl font-bold text-gray-900">Grupos al azar</p> <div class="flex flex-wrap gap-3"><!--[-->`);
			const each_array = ensure_array_like([
				2,
				3,
				4,
				5,
				6
			]);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let n = each_array[$$index];
				$$renderer.push(`<button class="px-6 py-4 rounded-2xl bg-indigo-600 text-white text-2xl font-bold">De ${escape_html(n)}</button>`);
			}
			$$renderer.push(`<!--]--></div></div> <div class="space-y-2"><p class="text-2xl font-bold text-gray-900">Agrupaciones guardadas</p> `);
			const each_array_1 = ensure_array_like(agrupaciones);
			if (each_array_1.length !== 0) {
				$$renderer.push("<!--[-->");
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let a = each_array_1[$$index_1];
					$$renderer.push(`<button class="w-full text-left px-5 py-4 rounded-2xl bg-white border-2 border-gray-200 active:bg-indigo-50"><span class="text-2xl font-semibold text-gray-900">${escape_html(a.nombre)}</span> <span class="block text-lg text-gray-500">${escape_html(a.sesion)} · ${escape_html(a.grupos.length)} grupos</span></button>`);
				}
			} else $$renderer.push(`<!--[!--><p class="text-xl text-gray-400">Todavía no hay agrupaciones guardadas de este curso (se arman en Agrupamientos).</p>`);
			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="space-y-4"><div class="flex flex-wrap items-center gap-3"><p class="text-3xl font-bold text-gray-900">${escape_html(titulo())}</p> `);
			if (azar && azarTamano) $$renderer.push(`<!--[0--><button class="px-5 py-3 rounded-xl bg-indigo-100 text-indigo-800 text-xl">🎲 Mezclar de nuevo</button>`);
			else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <button class="ml-auto px-5 py-3 rounded-xl bg-gray-100 text-gray-700 text-xl">← Otras opciones</button></div> <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"><!--[-->`);
			const each_array_2 = ensure_array_like(actual());
			for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
				let grupo = each_array_2[i];
				$$renderer.push(`<div class="rounded-2xl bg-white border-4 p-4 space-y-2"${attr_style(`border-color:${stringify(COLORES[i % COLORES.length])}`)}><p class="text-2xl font-extrabold"${attr_style(`color:${stringify(COLORES[i % COLORES.length])}`)}>Grupo ${escape_html(i + 1)}</p> <!--[-->`);
				const each_array_3 = ensure_array_like(grupo);
				for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
					let m = each_array_3[$$index_2];
					$$renderer.push(`<div><p class="text-2xl text-gray-900 leading-tight">${escape_html(m.nombre)}</p> `);
					if (m.rol) $$renderer.push(`<!--[0--><p class="text-lg text-amber-700">${escape_html(m.rol)}</p>`);
					else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
// src/lib/components/pizarra/PlanoPizarra.svelte
function PlanoPizarra($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { plano, cursoId } = $$props;
		if (!plano) $$renderer.push(`<!--[0--><div class="text-center py-10 space-y-2"><p class="text-2xl text-gray-500">Este curso todavía no tiene un plano del aula guardado.</p> <p class="text-lg text-gray-400">Se arma desde la app en “Plano del aula” (/aula/${escape_html(cursoId)}).</p></div>`);
		else {
			$$renderer.push(`<!--[-1--><div class="space-y-3"><div class="bg-gray-800 text-white text-xl text-center rounded-xl py-2">🧑‍🏫 Frente del aula</div> <div class="grid gap-x-10 gap-y-4"${attr_style(`grid-template-columns: repeat(${stringify(plano.columnas)}, minmax(0, 1fr));`)}><!--[-->`);
			const each_array = ensure_array_like(plano.bancos);
			for (let b = 0, $$length = each_array.length; b < $$length; b++) {
				let banco = each_array[b];
				$$renderer.push(`<div class="rounded-xl border-2 border-amber-300 bg-amber-50 p-2 space-y-1"><p class="text-sm text-amber-800 font-medium">Banco ${escape_html(b + 1)}</p> <div class="grid gap-1"${attr_style(`grid-template-columns: repeat(${stringify(banco.length)}, minmax(0, 1fr));`)}><!--[-->`);
				const each_array_1 = ensure_array_like(banco);
				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let s = each_array_1[$$index];
					$$renderer.push(`<p${attr_class(`rounded-lg bg-white px-2 py-2 text-xl leading-tight ${s ? "text-gray-900" : "text-gray-300"}`)}>${escape_html(s ? s.nombre : "libre")}</p>`);
				}
				$$renderer.push(`<!--]--></div></div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
// src/lib/components/pizarra/Temporizador.svelte
function Temporizador($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const PRESETS = [
			1,
			2,
			3,
			5,
			10,
			15,
			20,
			30
		];
		let totalMs = 3e5;
		let restanteMs = 3e5;
		let corriendo = false;
		const mmss = (ms) => {
			const s = Math.ceil(ms / 1e3);
			return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
		};
		let fraccion = derived(() => restanteMs / totalMs);
		let color = derived(() => fraccion() <= .1 ? "text-red-600" : fraccion() <= .25 ? "text-amber-500" : "text-gray-900");
		let barra = derived(() => fraccion() <= .1 ? "#dc2626" : fraccion() <= .25 ? "#f59e0b" : "#4f46e5");
		function detener() {
			corriendo = false;
		}
		onDestroy(detener);
		$$renderer.push(`<div class="flex flex-col items-center gap-6 py-4"><p${attr_class(`font-mono font-extrabold tabular-nums leading-none text-[7rem] md:text-[11rem] ${color()} `)}>${escape_html(mmss(restanteMs))}</p> <div class="w-full max-w-4xl h-5 bg-gray-200 rounded-full overflow-hidden"><div class="h-full rounded-full transition-[width] duration-200"${attr_style(`width:${stringify(fraccion() * 100)}%; background:${barra()}`)}></div></div> <div class="flex flex-wrap justify-center gap-3">`);
		if (corriendo) $$renderer.push(`<!--[0--><button class="px-12 py-6 rounded-2xl bg-amber-500 text-white text-3xl font-bold">⏸ Pausa</button>`);
		else $$renderer.push(`<!--[-1--><button class="px-12 py-6 rounded-2xl bg-indigo-600 text-white text-3xl font-bold">▶ Iniciar</button>`);
		$$renderer.push(`<!--]--> <button class="px-6 py-6 rounded-2xl bg-gray-100 text-gray-700 text-2xl">↺</button> <button class="px-6 py-6 rounded-2xl bg-gray-100 text-gray-700 text-2xl">−1 min</button> <button class="px-6 py-6 rounded-2xl bg-gray-100 text-gray-700 text-2xl">+1 min</button></div> <div class="flex flex-wrap justify-center gap-2"><!--[-->`);
		const each_array = ensure_array_like(PRESETS);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let m = each_array[$$index];
			$$renderer.push(`<button${attr_class(`px-5 py-3 rounded-xl text-xl font-semibold ${totalMs === m * 6e4 && !corriendo ? "bg-indigo-100 text-indigo-800" : "bg-white border border-gray-200 text-gray-700"}`)}>${escape_html(m)} min</button>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
	});
}
// src/lib/components/pizarra/AgendaClase.svelte
function AgendaClase($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { cursoId } = $$props;
		`${cursoId}${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}`;
		let items = [];
		let nuevo = "";
		$$renderer.push(`<div class="max-w-4xl mx-auto space-y-4 py-2"><p class="text-3xl font-bold text-gray-900">📋 Hoy en clase</p> <ol class="space-y-2">`);
		const each_array = ensure_array_like(items);
		if (each_array.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let it = each_array[i];
				$$renderer.push(`<li class="flex items-center gap-3"><button${attr_class(`flex-1 flex items-center gap-4 text-left px-5 py-4 rounded-2xl bg-white border-2 ${it.hecho ? "border-green-300" : "border-gray-200"}`)}><span class="text-3xl">${escape_html(it.hecho ? "✅" : `${i + 1}.`)}</span> <span${attr_class(`text-3xl ${it.hecho ? "line-through text-gray-400" : "text-gray-900"}`)}>${escape_html(it.texto)}</span></button> <button class="px-4 py-4 text-2xl text-gray-300 active:text-red-500" aria-label="Quitar">✕</button></li>`);
			}
		} else $$renderer.push(`<!--[!--><p class="text-xl text-gray-400">Todavía no hay pasos. Escribí el primero abajo.</p>`);
		$$renderer.push(`<!--]--></ol> <form class="flex gap-2"><input${attr("value", nuevo)} maxlength="120" placeholder="Ej.: Repaso de la clase anterior" class="flex-1 text-2xl px-4 py-3 rounded-xl border border-gray-300 select-text"/> <button type="submit" class="px-6 py-3 rounded-xl bg-indigo-600 text-white text-2xl font-bold">+ Agregar</button></form></div>`);
	});
}
// src/lib/components/pizarra/SemaforoRuido.svelte
function SemaforoRuido($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activo = false;
		let nivel = 0;
		let sensibilidad = 50;
		let stream = null;
		let ctx = null;
		let raf = 0;
		let umbralAmarillo = derived(() => 70 - sensibilidad * .4);
		let umbralRojo = derived(() => 90 - sensibilidad * .4);
		let estado = derived(() => nivel >= umbralRojo() ? "rojo" : nivel >= umbralAmarillo() ? "amarillo" : "verde");
		const COLOR = {
			verde: "#16a34a",
			amarillo: "#f59e0b",
			rojo: "#dc2626"
		};
		const TEXTO = {
			verde: "Volumen adecuado",
			amarillo: "Bajemos un poco",
			rojo: "Mucho ruido"
		};
		function apagar() {
			cancelAnimationFrame(raf);
			stream?.getTracks().forEach((t) => t.stop());
			ctx?.close().catch(() => {});
			stream = null;
			ctx = null;
			activo = false;
			nivel = 0;
		}
		onDestroy(apagar);
		$$renderer.push(`<div class="flex flex-col items-center gap-6 py-4">`);
		if (!activo) {
			$$renderer.push(`<!--[0--><p class="text-2xl text-gray-600 text-center max-w-2xl">Muestra en grande si el volumen del aula está bien. Usa el micrófono del equipo; el sonido no se graba ni se envía.</p> <button class="px-12 py-6 rounded-2xl bg-indigo-600 text-white text-3xl font-bold">🎤 Activar</button> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		} else $$renderer.push(`<!--[-1--><div class="w-64 h-64 md:w-80 md:h-80 rounded-full transition-colors duration-300 flex items-center justify-center"${attr_style(`background:${stringify(COLOR[estado()])}`)}><span class="text-white text-3xl md:text-4xl font-extrabold text-center px-6">${escape_html(TEXTO[estado()])}</span></div> <div class="w-full max-w-3xl h-6 bg-gray-200 rounded-full overflow-hidden"><div class="h-full rounded-full"${attr_style(`width:${stringify(nivel)}%; background:${stringify(COLOR[estado()])}`)}></div></div> <label class="flex items-center gap-4 text-xl text-gray-700">Sensibilidad <input type="range" min="0" max="100"${attr("value", sensibilidad)} class="w-64"/></label> <button class="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 text-xl">Apagar micrófono</button>`);
		$$renderer.push(`<!--]--></div>`);
	});
}
// src/routes/pizarra/[cursoId]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const TABS = [
			{
				id: "azar",
				lbl: "🎲 Al azar"
			},
			{
				id: "grupos",
				lbl: "👥 Grupos"
			},
			{
				id: "plano",
				lbl: "🪑 Plano"
			},
			{
				id: "tiempo",
				lbl: "⏱️ Temporizador"
			},
			{
				id: "agenda",
				lbl: "📋 Agenda"
			},
			{
				id: "ruido",
				lbl: "🔊 Ruido"
			}
		];
		const inicial = page.url.searchParams.get("tab");
		let tab = TABS.some((t) => t.id === inicial) ? inicial : "azar";
		head("10n6dr0", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Pizarra — ${escape_html(data.cursoNombre)}</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="flex flex-wrap items-center gap-3"><a href="/pizarra" class="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 text-lg">← Cursos</a> <p class="text-2xl md:text-3xl font-bold text-gray-900">${escape_html(data.cursoNombre)}</p> <span class="text-lg text-gray-500">${escape_html(data.roster.length)} alumnos</span></div> <nav class="flex flex-wrap gap-2"><!--[-->`);
		const each_array = ensure_array_like(TABS);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let t = each_array[$$index];
			$$renderer.push(`<button${attr_class(`px-5 py-4 rounded-2xl text-xl font-semibold transition-colors ${tab === t.id ? "bg-indigo-600 text-white" : "bg-white border-2 border-gray-200 text-gray-700"}`)}>${escape_html(t.lbl)}</button>`);
		}
		$$renderer.push(`<!--]--></nav> `);
		if (data.roster.length === 0) $$renderer.push(`<!--[0--><p class="text-xl text-amber-700">No se pudo traer la lista de alumnos desde Moodle.</p>`);
		else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <!---->`);
		$$renderer.push(`<section${attr_class("", void 0, { "hidden": tab !== "azar" })}>`);
		AlumnoAlAzar($$renderer, {
			cursoId: data.cursoId,
			roster: data.roster
		});
		$$renderer.push(`<!----></section> <section${attr_class("", void 0, { "hidden": tab !== "grupos" })}>`);
		GruposPizarra($$renderer, {
			agrupaciones: data.agrupaciones,
			azar: data.azar,
			azarTamano: data.azarTamano
		});
		$$renderer.push(`<!----></section> <section${attr_class("", void 0, { "hidden": tab !== "plano" })}>`);
		PlanoPizarra($$renderer, {
			plano: data.plano,
			cursoId: data.cursoId
		});
		$$renderer.push(`<!----></section> <section${attr_class("", void 0, { "hidden": tab !== "tiempo" })}>`);
		Temporizador($$renderer);
		$$renderer.push(`<!----></section> <section${attr_class("", void 0, { "hidden": tab !== "agenda" })}>`);
		AgendaClase($$renderer, { cursoId: data.cursoId });
		$$renderer.push(`<!----></section> <section${attr_class("", void 0, { "hidden": tab !== "ruido" })}>`);
		SemaforoRuido($$renderer);
		$$renderer.push(`<!----></section>`);
		$$renderer.push(`<!----></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-GYU5u2_l.js.map
