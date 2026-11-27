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
const component = async () => component_cache ??= (await import('./_layout.svelte-DzBRiqjJ.js')).default;
const server_id = "src/routes/admin/+layout.server.ts";
const imports = ["_app/immutable/nodes/2.LC85Va3n.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/4WnCJOoR.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=2-bD7j3t8a.js.map
