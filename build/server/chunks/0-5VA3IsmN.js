import { redirect } from '@sveltejs/kit';

// src/routes/+layout.server.ts
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
const component = async () => component_cache ??= (await import('./_layout.svelte-B8WlIegi.js')).default;
const server_id = "src/routes/+layout.server.ts";
const imports = ["_app/immutable/nodes/0.B6H3-nxs.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js","_app/immutable/chunks/C88JlKnk.js","_app/immutable/chunks/DeF1vw6K.js"];
const stylesheets = ["_app/immutable/assets/0.CQ_TpySb.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=0-5VA3IsmN.js.map
