import { redirect } from '@sveltejs/kit';

//#region src/routes/+layout.server.ts
var load = async ({ locals, url }) => {
	const isAuthRoute = url.pathname.startsWith("/auth");
	if (url.pathname.startsWith("/api")) return { usuario: locals.usuario };
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
const component = async () => component_cache ??= (await import('./_layout.svelte-DGxzZTI2.js')).default;
const server_id = "src/routes/+layout.server.ts";
const imports = ["_app/immutable/nodes/0.BguFcNp4.js","_app/immutable/chunks/BYJUstCy.js","_app/immutable/chunks/CLHN2XE7.js","_app/immutable/chunks/CR-wpuFV.js","_app/immutable/chunks/BD-4OuCl.js"];
const stylesheets = ["_app/immutable/assets/0.D62fJSjQ.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=0-Czn8oTN4.js.map
