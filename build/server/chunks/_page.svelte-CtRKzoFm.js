import { h as head, e as escape_html } from './dev-BsmPEhme.js';

//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		head("1uha8ag", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Inicio — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-5"><div><h1 class="text-xl font-bold text-gray-900">Hola, ${escape_html(data.usuario?.nombre?.split(" ")[0])} 👋</h1> <p class="text-gray-500 text-sm">Panel de registro docente</p></div> <div class="card"><div class="flex items-center justify-between mb-2"><h2 class="font-semibold text-gray-700 text-sm">Estado de conexión</h2> `);
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
		$$renderer.push(`<!--]--></div> <div class="grid grid-cols-2 gap-3"><a href="/observaciones/nueva" class="card flex flex-col items-center py-5 gap-2 hover:border-indigo-300 transition-colors text-center"><span class="text-3xl">✏️</span> <span class="font-medium text-gray-800 text-sm">Nueva observación</span></a> <a href="/cursos" class="card flex flex-col items-center py-5 gap-2 hover:border-indigo-300 transition-colors text-center"><span class="text-3xl">📚</span> <span class="font-medium text-gray-800 text-sm">Ver cursos</span> `);
		if (data.totalCursos > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="text-xs text-gray-400">${escape_html(data.totalCursos)} disponibles</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></a> <a href="/observaciones/historial" class="card flex flex-col items-center py-5 gap-2 hover:border-indigo-300 transition-colors text-center"><span class="text-3xl">📋</span> <span class="font-medium text-gray-800 text-sm">Historial</span></a> <a href="/admin/status" class="card flex flex-col items-center py-5 gap-2 hover:border-indigo-300 transition-colors text-center"><span class="text-3xl">🔧</span> <span class="font-medium text-gray-800 text-sm">Estado Moodle</span></a></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CtRKzoFm.js.map
