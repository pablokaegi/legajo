import { S as escape_html } from './dev-BsNQnjV4.js';
import { p as page } from './state-C8z2SGc0.js';
import './client2-DY2-eyjS.js';
import './internal-BjAybRdT.js';
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
//# sourceMappingURL=error.svelte-GRkBmHxk.js.map
