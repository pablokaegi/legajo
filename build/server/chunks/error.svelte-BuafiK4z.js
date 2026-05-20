import { S as escape_html } from './dev-BsNQnjV4.js';
import { p as page } from './state-BAKE00pI.js';
import './client2-Dw5pkKv1.js';
import './internal-BF-UINDd.js';
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
//# sourceMappingURL=error.svelte-BuafiK4z.js.map
