import { h as head, b as attr, s as stringify, e as escape_html } from './dev-BsmPEhme.js';
import { K as KioskoVotacion } from './KioskoVotacion-D2oNw4G2.js';
import './client2-DAWEgQoO.js';
import './internal--VVhw5xG.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';
import './institucional-Ccb6xWsP.js';

//#region src/routes/institucional/agrupamientos/[id]/votar/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		head("qlil04", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Votación — ${escape_html(data.sesion.titulo)}</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-3"><a${attr("href", `/institucional/agrupamientos/${stringify(data.sesion.id)}`)} class="text-indigo-600 text-sm hover:underline">← Volver al panel</a> `);
		KioskoVotacion($$renderer, {
			titulo: data.sesion.titulo,
			cursoNombre: data.sesion.cursoNombre,
			roster: data.roster,
			yaVotaron: data.yaVotaron,
			asignaciones: data.asignaciones,
			cerrada: data.sesion.estado === "cerrada",
			action: "?/votar",
			form
		});
		$$renderer.push(`<!----></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CN82bL3e.js.map
