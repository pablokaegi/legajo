//#region src/routes/preceptor/+page.server.ts
var load = async ({ locals }) => {
	return { usuario: locals.usuario };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 30;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-KzbC1_Ul.js')).default;
const server_id = "src/routes/preceptor/+page.server.ts";
const imports = ["_app/immutable/nodes/30.B5GsT8ix.js","_app/immutable/chunks/85pPpyzY.js","_app/immutable/chunks/BaKrtv6m.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=30-DJSnQgiC.js.map
