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
const component = async () => component_cache ??= (await import('./_layout.svelte-Bk6T56AC.js')).default;
const server_id = "src/routes/+layout.server.ts";
const imports = ["_app/immutable/nodes/0.D-FMQkaq.js","_app/immutable/chunks/CcZ_XLq7.js","_app/immutable/chunks/Dcis9sER.js","_app/immutable/chunks/BucuNVqd.js","_app/immutable/chunks/6xwAJV1g.js"];
const stylesheets = ["_app/immutable/assets/0.5CrkBBL0.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=0-Bu7TDash.js.map
