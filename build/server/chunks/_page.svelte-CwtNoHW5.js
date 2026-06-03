import { h as head, e as escape_html, a as ensure_array_like, b as attr } from './dev-BsmPEhme.js';

//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const accesos = [
			{
				href: "/observaciones/nueva",
				img: "/imagenes/PNG/480px/001-studying.png",
				titulo: "Nueva observación"
			},
			{
				href: "/cursos",
				img: "/imagenes/PNG/480px/019-books.png",
				titulo: "Ver cursos",
				extra: data.totalCursos > 0 ? `${data.totalCursos} disponibles` : null
			},
			{
				href: "/observaciones/historial",
				img: "/imagenes/PNG/480px/015-notebook.png",
				titulo: "Historial"
			},
			{
				href: "/agrupamientos",
				img: "/imagenes/PNG/480px/014-online%20education.png",
				titulo: "Agrupamientos"
			}
		];
		head("1uha8ag", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Inicio — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-5 text-white shadow-lg"><div class="relative z-10 pr-24"><p class="text-sm text-indigo-100">Hola,</p> <h1 class="text-2xl font-bold">${escape_html(data.usuario?.nombre?.split(" ")[0] ?? "")} 👋</h1> <p class="text-sm text-indigo-100 mt-1">Bienvenido/a a Legajo Digital — Puertas del Sol</p></div> <img src="/imagenes/PNG/480px/004-education.png" alt="" class="absolute -right-2 -bottom-2 w-28 h-28 object-contain drop-shadow-lg pointer-events-none"/></div> <div class="card"><div class="flex items-center justify-between mb-2"><h2 class="font-semibold text-gray-700 text-sm">Estado de conexión</h2> `);
		if (data.moodleStatus.ok) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="badge-ok">● Conectado</span>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<span class="badge-error">● Error</span>`);
		}
		$$renderer.push(`<!--]--></div> <p class="text-sm text-gray-600">${escape_html(data.moodleStatus.mensaje)}</p> `);
		if (data.moodleStatus.sitename) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-xs text-gray-400 mt-1">Sitio: ${escape_html(data.moodleStatus.sitename)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="grid grid-cols-2 gap-3"><!--[-->`);
		const each_array = ensure_array_like(accesos);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let a = each_array[$$index];
			$$renderer.push(`<a${attr("href", a.href)} class="card flex flex-col items-center py-4 gap-2 hover:border-indigo-300 hover:shadow-md transition-all text-center"><img${attr("src", a.img)} alt="" class="w-16 h-16 object-contain"/> <span class="font-medium text-gray-800 text-sm">${escape_html(a.titulo)}</span> `);
			if (a.extra) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="text-xs text-gray-400">${escape_html(a.extra)}</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></a>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CwtNoHW5.js.map
