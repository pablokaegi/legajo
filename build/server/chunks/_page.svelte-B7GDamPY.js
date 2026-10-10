import { h as head, b as attr, s as stringify, e as escape_html } from './dev-Dj5mSuMo.js';
import { K as KioskoVotacion } from './KioskoVotacion-BMh2nCgE.js';
import './client2-BLuH5cYu.js';
import './internal-DGke0biV.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';
import './institucional-Ccb6xWsP.js';

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
//# sourceMappingURL=_page.svelte-B7GDamPY.js.map
