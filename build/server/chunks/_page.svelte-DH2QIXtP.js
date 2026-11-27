import { h as head, a as attr, s as stringify, e as escape_html } from './dev-CsaMOlNk.js';
import { K as KioskoVotacion } from './KioskoVotacion-Be9W9USv.js';
import './state-BTDbInvN.js';
import './client2-i6F8J7u1.js';
import './internal-BSUXWn6e.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/agrupamientos/[id]/votar/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		head("a9ly07", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Votación — ${escape_html(data.sesion.titulo)}</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-3"><a${attr("href", `/agrupamientos/${stringify(data.sesion.id)}`)} class="text-indigo-600 text-sm hover:underline">← Volver al panel</a> `);
		KioskoVotacion($$renderer, {
			titulo: data.sesion.titulo,
			cursoNombre: data.sesion.cursoNombre,
			roster: data.roster,
			yaVotaron: data.yaVotaron,
			asignaciones: data.asignaciones,
			modo: data.modo,
			maxElecciones: data.sesion.cantidadEvaluar,
			permiteBloqueo: data.sesion.permiteBloqueo,
			cerrada: data.sesion.estado === "cerrada",
			action: "?/votar",
			form
		});
		$$renderer.push(`<!----></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DH2QIXtP.js.map
