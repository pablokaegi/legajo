import { d as db, s as syncLogs } from './db-D7hI4G6x.js';
import { redirect } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import './index.js-D6_LEqEo.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';

// src/routes/admin/status/+page.server.ts
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
const component = async () => component_cache ??= (await import('./_page.svelte-Dp5kFnNu.js')).default;
const server_id = "src/routes/admin/status/+page.server.ts";
const imports = ["_app/immutable/nodes/11.DpNPYaZT.js","_app/immutable/chunks/Bzv1IF9H.js","_app/immutable/chunks/Cu7baIY8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=11-B7dj5CPM.js.map
