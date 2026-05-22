import { redirect } from '@sveltejs/kit';

//#region src/routes/institucional/+page.server.ts
var load = async () => {
	throw redirect(302, "/institucional/efemerides");
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 17;
const server_id = "src/routes/institucional/+page.server.ts";
const imports = [];
const stylesheets = [];
const fonts = [];

export { fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=17-JLcp911U.js.map
