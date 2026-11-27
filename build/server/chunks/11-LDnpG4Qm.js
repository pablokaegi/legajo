import { d as db, f as syncLogs } from './db-CLN6I8p_.js';
import { redirect } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';

//#region src/routes/admin/status/+page.server.ts
var load = async ({ locals }) => {
	if (!locals.usuario) throw redirect(303, "/auth");
	return { logs: await db.select().from(syncLogs).orderBy(desc(syncLogs.createdAt)).limit(50) };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 11;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-0vCRi33S.js')).default;
const server_id = "src/routes/admin/status/+page.server.ts";
const imports = ["_app/immutable/nodes/11.D7jvMIy4.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/DymAb4Hh.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=11-LDnpG4Qm.js.map
