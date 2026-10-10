import { redirect } from '@sveltejs/kit';

//#region src/routes/+layout.server.ts
var load = async ({ locals, url }) => {
	const isAuthRoute = url.pathname.startsWith("/auth");
	const isApiRoute = url.pathname.startsWith("/api");
	const isPublicRoute = url.pathname.startsWith("/votar/") || url.pathname.startsWith("/autorizar/");
	if (isApiRoute || isPublicRoute) return { usuario: locals.usuario };
	if (!locals.usuario && !isAuthRoute) redirect(303, `/auth?redirect=${encodeURIComponent(url.pathname)}`);
	if (locals.usuario && isAuthRoute) redirect(303, "/");
	return { usuario: locals.usuario };
};

var _layout_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 0;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-DzlP0WTR.js')).default;
const server_id = "src/routes/+layout.server.ts";
const imports = ["_app/immutable/nodes/0.CR1Ut82V.js","_app/immutable/chunks/aQzoJU20.js","_app/immutable/chunks/jdNgL1WM.js","_app/immutable/chunks/BpBdz8fz.js","_app/immutable/chunks/CB-M-fzd.js"];
const stylesheets = ["_app/immutable/assets/0.DJHwXj7S.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=0-xx-Es5YU.js.map
