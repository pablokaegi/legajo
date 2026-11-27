import { h as head, a as attr, e as escape_html, b as attr_class, c as clsx$1, d as ensure_array_like, s as stringify, f as derived } from './dev-CsaMOlNk.js';
import { p as page } from './state-BTDbInvN.js';
import './client2-i6F8J7u1.js';
import './internal-BSUXWn6e.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;
		const ROL_PRECEPTOR = [
			"admin",
			"preceptor",
			"directivo"
		];
		const ROL_STAFF = [
			"admin",
			"docente",
			"preceptor",
			"directivo",
			"gabinete"
		];
		const ROL_GABINETE = ["admin", "gabinete"];
		const roles = derived(() => data.usuario?.roles ?? []);
		const vistaAula = derived(() => page.url.pathname === "/aula/oral" || page.url.pathname === "/gabinete/aula-ciencias" || page.url.pathname.startsWith("/laboratorio/apoyos"));
		const tiene = (lista) => roles().some((r) => lista.includes(r));
		const soloFamilia = derived(() => roles().length > 0 && roles().every((r) => r === "padre"));
		const navItems = derived(() => [
			{
				href: "/",
				label: "Inicio",
				icon: "🏠",
				ok: true
			},
			{
				href: "/cursos",
				label: "Cursos",
				icon: "📚",
				ok: true
			},
			{
				href: "/observaciones/nueva",
				label: "Nueva",
				icon: "✏️",
				ok: true
			},
			{
				href: "/observaciones/historial",
				label: "Historial",
				icon: "📋",
				ok: true
			},
			{
				href: "/agrupamientos",
				label: "Agrupamientos",
				icon: "🧩",
				ok: tiene(ROL_STAFF)
			},
			{
				href: "/pizarra",
				label: "Pizarra",
				icon: "🖥️",
				ok: tiene(ROL_STAFF)
			},
			{
				href: "/gabinete",
				label: "Gabinete",
				icon: "🧠",
				ok: tiene(ROL_GABINETE)
			},
			{
				href: "/preceptor",
				label: "Preceptor",
				icon: "📌",
				ok: tiene(ROL_PRECEPTOR)
			},
			{
				href: "/institucional",
				label: "Institucional",
				icon: "🏫",
				ok: tiene(ROL_PRECEPTOR)
			},
			{
				href: "/admin",
				label: "Config",
				icon: "⚙️",
				ok: tiene(["admin"])
			}
		].filter((i) => i.ok || !soloFamilia()));
		function isActive(href) {
			if (href === "/") return page.url.pathname === "/";
			return page.url.pathname.startsWith(href);
		}
		head("12qhfyh", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(data.institucion.app)}</title>`);
			});
			$$renderer.push(`<link rel="icon"${attr("href", data.institucion.icono)} type="image/png"/> <link rel="apple-touch-icon"${attr("href", data.institucion.icono)}/> <meta name="theme-color"${attr("content", data.institucion.color)}/> <link rel="manifest"${attr("href", data.institucion.manifiesto)}/>`);
		});
		if (data.usuario && !page.url.pathname.startsWith("/autorizar/") && !page.url.pathname.startsWith("/votar/") && !page.url.pathname.startsWith("/pizarra")) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="min-h-screen bg-gray-50 flex flex-col"${attr("data-marca", data.institucion.alere ? "alere" : void 0)}><header class="print:hidden bg-indigo-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-md"><a href="/"${attr("aria-label", data.institucion.app + " · Inicio")} class="flex items-center gap-2"><img${attr("src", data.institucion.logo)}${attr("alt", data.institucion.sigla)} class="h-8 w-auto" onerror="this.__e=event"/> <span class="font-bold text-lg tracking-tight hidden sm:inline">Legajo</span></a> <div class="flex items-center gap-3"><span class="text-sm opacity-90 hidden sm:block">${escape_html(data.usuario.nombre)}</span> <form method="POST" action="/auth?/logout"><button type="submit" class="text-sm bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded-lg transition-colors">Salir</button></form></div></header> <main${attr_class(clsx$1(vistaAula() ? "flex-1 min-w-0 w-full max-w-7xl mx-auto px-4 py-5" : "flex-1 pb-20 sm:pb-6 max-w-2xl w-full mx-auto px-4 py-5"))}>`);
			children($$renderer);
			$$renderer.push(`<!----></main> `);
			if (!vistaAula()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<nav class="print:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex sm:hidden z-10"><!--[-->`);
				const each_array = ensure_array_like(navItems());
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];
					if (item.ok) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<a${attr("href", item.href)}${attr_class(`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${stringify(isActive(item.href) ? "text-indigo-600 font-semibold" : "text-gray-500 hover:text-indigo-500")}`)}><span class="text-xl leading-none mb-0.5">${escape_html(item.icon)}</span> ${escape_html(item.label)}</a>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<span aria-disabled="true" title="No habilitado para tu rol" class="flex-1 flex flex-col items-center py-2 text-xs text-gray-400 opacity-40 grayscale cursor-not-allowed select-none"><span class="text-xl leading-none mb-0.5">${escape_html(item.icon)}</span> ${escape_html(item.label)}</span>`);
					}
					$$renderer.push(`<!--]-->`);
				}
				$$renderer.push(`<!--]--></nav> <nav class="print:hidden hidden sm:flex fixed left-0 top-14 bottom-0 w-48 bg-white border-r border-gray-200 flex-col pt-4 px-2 gap-1"><!--[-->`);
				const each_array_1 = ensure_array_like(navItems());
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let item = each_array_1[$$index_1];
					if (item.ok) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<a${attr("href", item.href)}${attr_class(`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${stringify(isActive(item.href) ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50")}`)}><span>${escape_html(item.icon)}</span> ${escape_html(item.label)}</a>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<span aria-disabled="true" title="No habilitado para tu rol" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 opacity-50 cursor-not-allowed select-none"><span class="grayscale">${escape_html(item.icon)}</span> ${escape_html(item.label)} <span class="ml-auto text-[10px]">🔒</span></span>`);
					}
					$$renderer.push(`<!--]-->`);
				}
				$$renderer.push(`<!--]--></nav>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="min-h-screen bg-gray-50"${attr("data-marca", data.institucion.alere ? "alere" : void 0)}>`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-DIwxVRsD.js.map
