import { h as head, e as escape_html, d as ensure_array_like, a as attr, f as derived } from './dev-CsaMOlNk.js';

//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const roles = derived(() => data.usuario?.roles ?? []);
		const tiene = (lista) => roles().some((r) => lista.includes(r));
		const STAFF = [
			"admin",
			"docente",
			"preceptor",
			"directivo",
			"gabinete"
		];
		const soloFamilia = derived(() => roles().length > 0 && roles().every((r) => r === "padre"));
		const accesos = derived(() => [
			{
				href: "/observaciones/nueva",
				titulo: "Nueva observación",
				ok: true,
				extra: null
			},
			{
				href: "/cursos",
				titulo: "Ver cursos",
				ok: true,
				extra: data.totalCursos > 0 ? `${data.totalCursos} disponibles` : null
			},
			{
				href: "/observaciones/historial",
				titulo: "Historial",
				ok: true,
				extra: null
			},
			{
				href: "/agrupamientos",
				titulo: "Agrupamientos",
				ok: tiene(STAFF),
				extra: null
			},
			{
				href: "/pizarra",
				titulo: "Modo pizarra",
				ok: tiene(STAFF),
				extra: null
			},
			{
				href: "/derivar",
				titulo: "Derivar al gabinete",
				ok: tiene(STAFF),
				extra: null
			},
			{
				href: "/gabinete",
				titulo: "Gabinete psicopedagógico",
				ok: tiene(["admin", "gabinete"]),
				extra: null
			}
		].filter((a) => a.ok || !soloFamilia()));
		head("1uha8ag", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Inicio — ${escape_html(data.institucion.app)}</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="bienvenida-alere rounded-2xl px-6 py-7 text-white shadow-sm"><h1 class="font-serif text-3xl">Hola`);
		if (data.usuario?.nombre) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`, ${escape_html(data.usuario.nombre.split(" ")[0])}`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></h1> <p class="mt-1 text-sm text-indigo-100">Legajo Digital · ${escape_html(data.institucion.corto)}</p></div> <div class="card"><div class="flex items-center justify-between mb-2"><h2 class="font-semibold text-gray-700 text-sm">Estado de conexión</h2> `);
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
		$$renderer.push(`<!--]--></div> <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">`);
		if (data.aulaOralDisponible) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<a href="/aula/oral" class="card flex items-center justify-between gap-3 border-l-4 border-l-indigo-600 hover:border-indigo-400 sm:col-span-2"><span><strong class="block">Aula en Legajo</strong><span class="text-sm text-gray-600">Oral de Ciencias · Moodle de prueba</span></span> <span class="text-xl text-indigo-600" aria-hidden="true">→</span></a>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (data.apoyosDisponibles) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<a href="/laboratorio/apoyos" class="card flex items-center justify-between gap-3 border-l-4 border-l-indigo-600 hover:border-indigo-400 sm:col-span-2"><span><strong class="block">Laboratorio de apoyos</strong><span class="text-sm text-gray-600">Acompañamiento por estudiante y actividades de Ciencias</span></span> <span class="text-xl text-indigo-600" aria-hidden="true">→</span></a>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <!--[-->`);
		const each_array = ensure_array_like(accesos());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let a = each_array[$$index];
			if (a.ok) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<a${attr("href", a.href)} class="card flex min-h-16 items-center justify-between gap-3 hover:border-indigo-400 hover:bg-indigo-50"><span class="font-semibold text-indigo-900">${escape_html(a.titulo)} `);
				if (a.extra) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<small class="block font-normal text-gray-600">${escape_html(a.extra)}</small>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></span> <span class="text-lg text-indigo-600" aria-hidden="true">→</span></a>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div aria-disabled="true" title="No habilitado para tu rol" class="card flex min-h-16 flex-col justify-center bg-gray-50"><span class="font-medium text-gray-600">${escape_html(a.titulo)}</span> <span class="text-xs text-gray-600">No habilitado para tu rol</span></div>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DW8f75el.js.map
