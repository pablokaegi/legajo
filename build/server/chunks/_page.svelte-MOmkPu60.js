import { R as head, S as escape_html, U as attr } from './dev-BsNQnjV4.js';
import './client2-BhQlrij_.js';
import './internal-CON1I-7W.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/auth/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { form } = $$props;
		let loading = false;
		head("1s728sz", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Ingresar — Legajo PDS</title>`);
			});
		});
		$$renderer.push(`<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4"><div class="w-full max-w-sm"><div class="text-center mb-8"><img src="/logo-pds.png" alt="Puertas del Sol" class="w-28 h-auto mx-auto mb-4 drop-shadow-sm" onerror="this.__e=event"/> <div id="logo-fallback" class="hidden items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg mx-auto"><span class="text-white text-2xl">📝</span></div> <h1 class="text-xl font-bold text-gray-900">Legajo Digital</h1> <p class="text-gray-500 text-sm mt-0.5">Puertas del Sol</p></div> <div class="card"><form method="POST" action="?/login" class="space-y-4">`);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div><label for="email" class="form-label">Email institucional</label> <input id="email" name="email" type="email" autocomplete="email" required=""${attr("value", form?.email ?? "")} placeholder="docente@pds.edu.ar" class="form-input"/></div> <div><label for="pin" class="form-label">PIN</label> <input id="pin" name="pin" type="password" inputmode="numeric" autocomplete="current-password" required="" maxlength="8" placeholder="••••••" class="form-input tracking-widest text-center text-lg"/></div> <button type="submit" class="btn-primary"${attr("disabled", loading, true)}>${escape_html("Ingresar")}</button></form></div> <p class="text-center text-xs text-gray-400 mt-6">¿No tenés acceso? Contactá al administrador del sistema.</p></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-MOmkPu60.js.map
