import { redirect } from '@sveltejs/kit';

//#region src/routes/admin/status/+page.server.ts
var load = async ({ locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	return {};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BfiP4yin.js')).default;
const server_id = "src/routes/admin/status/+page.server.ts";
const imports = ["_app/immutable/nodes/3.D4Ylh7ZB.js","_app/immutable/chunks/g7562_RU.js","_app/immutable/chunks/CsaauQz1.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=3-w3VwU8nP.js.map
