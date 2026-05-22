import { redirect } from '@sveltejs/kit';

//#region src/routes/institucional/+layout.server.ts
var load = async ({ locals, url }) => {
	if (!locals.usuario) throw redirect(303, `/auth?redirect=${encodeURIComponent(url.pathname)}`);
	return {};
};

var _layout_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-iK_6-6Ef.js')).default;
const server_id = "src/routes/institucional/+layout.server.ts";
const imports = ["_app/immutable/nodes/3.DTngWG2l.js","_app/immutable/chunks/85pPpyzY.js","_app/immutable/chunks/B-phfOky.js","_app/immutable/chunks/C2CxDrSD.js","_app/immutable/chunks/BaKrtv6m.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=3-UaLDbPpH.js.map
