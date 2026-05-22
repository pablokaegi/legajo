import { h as head, e as escape_html } from './dev-BsmPEhme.js';
import { K as KioskoVotacion } from './KioskoVotacion-CxCcxWca.js';
import './client2-BLaxDu7t.js';
import './internal-Ckplz8Up.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';
import './institucional-Ccb6xWsP.js';

//#region src/routes/votar/[token]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		head("1fn55uf", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Votación — ${escape_html(data.sesion.titulo)}</title>`);
			});
		});
		$$renderer.push(`<div class="min-h-screen bg-gray-50 py-6 px-4">`);
		KioskoVotacion($$renderer, {
			titulo: data.sesion.titulo,
			cursoNombre: data.sesion.cursoNombre,
			roster: data.roster,
			yaVotaron: data.yaVotaron,
			asignaciones: data.asignaciones,
			cerrada: data.sesion.estado === "cerrada",
			action: "",
			form
		});
		$$renderer.push(`<!----></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CmtV66wR.js.map
