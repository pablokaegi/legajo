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

const index = 4;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-D202jf1S.js')).default;
const server_id = "src/routes/admin/status/+page.server.ts";
const imports = ["_app/immutable/nodes/4.Cuct4cQp.js","_app/immutable/chunks/98Yg7eFK.js","_app/immutable/chunks/2TU3FloQ.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=4-CwzEMxqM.js.map
