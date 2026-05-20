import { e as escape_html } from './dev-BsmPEhme.js';
import { p as page } from './state-DM-8meLx.js';
import './client2-C-yzLCmw.js';
import './internal-B_IM9P9a.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region node_modules/@sveltejs/kit/src/runtime/components/svelte-5/error.svelte
function Error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>${escape_html(page.status)}</h1> <p>${escape_html(page.error?.message)}</p>`);
	});
}

export { Error as default };
//# sourceMappingURL=error.svelte-CqEUo-vZ.js.map
