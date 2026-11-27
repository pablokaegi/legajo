import { h as head, b as attr_class, i as attr_style, a as attr, e as escape_html } from './dev-CsaMOlNk.js';
import './client2-i6F8J7u1.js';
import './internal-BSUXWn6e.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/auth/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let loading = false;
		head("1s728sz", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Ingresar — Legajo ${escape_html(data.institucion.sigla)}</title>`);
			});
		});
		$$renderer.push(`<div${attr_class("min-h-screen flex items-center justify-center p-4", void 0, { "acceso-alere": true })}${attr_style("", { "background-color": data.institucion.color })}><div class="w-full max-w-sm relative"><div class="bg-white rounded-2xl shadow-2xl p-7 space-y-5"><div class="text-center"><img${attr("src", data.institucion.logo)}${attr("alt", data.institucion.corto)} class="w-44 rounded-lg h-auto mx-auto mb-3" onerror="this.__e=event"/> <div id="logo-fallback" class="hidden items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-3 shadow-lg mx-auto"><span class="text-white text-2xl">📝</span></div> <h1 class="text-xl font-bold text-gray-900">Legajo Digital</h1> <p class="text-gray-500 text-sm mt-0.5">${escape_html(data.institucion.nivel)}</p></div> <form method="POST" action="?/login" class="space-y-4">`);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div><label for="email" class="form-label">Email institucional</label> <input id="email" name="email" type="email" autocomplete="email" required=""${attr("value", form?.email ?? "")}${attr("placeholder", data.institucion.ejemploEmail)} class="form-input"/></div> <div><label for="pin" class="form-label">PIN</label> <input id="pin" name="pin" type="password" inputmode="numeric" autocomplete="current-password" required="" maxlength="8" placeholder="••••••" class="form-input tracking-widest text-center text-lg"/></div> <button type="submit" class="btn-primary"${attr("disabled", loading, true)}>${escape_html("Ingresar")}</button></form></div> <p class="text-center text-xs text-white/80 mt-5 drop-shadow">¿No tenés acceso? Contactá al administrador del sistema.</p></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DD2gQkf2.js.map
