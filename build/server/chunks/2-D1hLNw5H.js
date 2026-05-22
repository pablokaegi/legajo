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

const index = 2;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-8p2Abwj-.js')).default;
const server_id = "src/routes/institucional/+layout.server.ts";
const imports = ["_app/immutable/nodes/2.DlQNoDYG.js","_app/immutable/chunks/BwH-sKw0.js","_app/immutable/chunks/OxspwgFg.js","_app/immutable/chunks/CTSaFKi3.js","_app/immutable/chunks/BEDIq91W.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=2-D1hLNw5H.js.map
