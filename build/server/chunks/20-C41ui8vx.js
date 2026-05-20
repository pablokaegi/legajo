//#region src/routes/preceptor/+page.server.ts
var load = async ({ locals }) => {
	return { usuario: locals.usuario };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 20;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B95IcEGy.js')).default;
const server_id = "src/routes/preceptor/+page.server.ts";
const imports = ["_app/immutable/nodes/20.DYmYww9Q.js","_app/immutable/chunks/uSN3y40e.js","_app/immutable/chunks/B8WnZMYa.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=20-C41ui8vx.js.map
