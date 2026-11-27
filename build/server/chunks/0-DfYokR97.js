import { redirect } from '@sveltejs/kit';

//#region src/lib/server/institucional.ts
var alere = {
	alere: true,
	corto: "Alere",
	app: "Legajo Alere",
	sigla: "Alere",
	nombre: "Alere",
	nivel: "Campus de demostración",
	direccion: "",
	telefono: "",
	email: "",
	logo: "/alere/marca.webp",
	icono: "/alere/icono-192.png",
	manifiesto: "/alere/manifest.json",
	color: "#361f34",
	ejemploEmail: "docente@alere.example"
};
function identidadInstitucional() {
	return alere;
}
//#endregion
//#region src/routes/+layout.server.ts
var load = async ({ locals, url }) => {
	const isAuthRoute = url.pathname.startsWith("/auth");
	const isApiRoute = url.pathname.startsWith("/api");
	const isPublicRoute = url.pathname.startsWith("/votar/") || url.pathname.startsWith("/autorizar/");
	if (isApiRoute || isPublicRoute) return {
		usuario: locals.usuario,
		institucion: identidadInstitucional()
	};
	if (!locals.usuario && !isAuthRoute) redirect(303, `/auth?redirect=${encodeURIComponent(url.pathname)}`);
	if (locals.usuario && isAuthRoute) redirect(303, "/");
	return {
		usuario: locals.usuario,
		institucion: identidadInstitucional()
	};
};

var _layout_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 0;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-DIwxVRsD.js')).default;
const server_id = "src/routes/+layout.server.ts";
const imports = ["_app/immutable/nodes/0.DEIZXNN5.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/4WnCJOoR.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = ["_app/immutable/assets/0.ClkC0Ltm.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=0-DfYokR97.js.map
