import { redirect, error } from '@sveltejs/kit';

//#region src/routes/admin/+layout.server.ts
var load = async ({ locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	if (!locals.usuario.roles.includes("admin")) throw error(403, "Esta sección es solo para administradores del sistema.");
	return {};
};

var _layout_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 2;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-CP_vqkFc.js')).default;
const server_id = "src/routes/admin/+layout.server.ts";
const imports = ["_app/immutable/nodes/2.PJ7p9_PF.js","_app/immutable/chunks/CcZ_XLq7.js","_app/immutable/chunks/Dcis9sER.js","_app/immutable/chunks/BucuNVqd.js","_app/immutable/chunks/6xwAJV1g.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=2-DGLZg7jT.js.map
