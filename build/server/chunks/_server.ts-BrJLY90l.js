import { m as moodle, t as toMoodleErrorMessage } from './client-txz_W3Xb.js';
import { json } from '@sveltejs/kit';
import './db-D7hI4G6x.js';
import './index.js-D6_LEqEo.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

// src/routes/api/moodle/status/+server.ts
var GET = async ({ locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	if (!locals.usuario.roles.includes("admin")) return json({ error: "Acceso restringido a administradores" }, { status: 403 });
	try {
		const info = await moodle.getSiteInfo();
		return json({
			ok: true,
			sitename: info.sitename,
			siteurl: info.siteurl,
			moodleVersion: info.release,
			connectedAs: {
				userid: info.userid,
				username: info.username,
				fullname: `${info.firstname} ${info.lastname}`
			},
			funcionesHabilitadas: info.functions.map((f) => f.name).sort(),
			legajoFunctions: {
				"core_webservice_get_site_info": info.functions.some((f) => f.name === "core_webservice_get_site_info"),
				"core_course_get_courses": info.functions.some((f) => f.name === "core_course_get_courses"),
				"core_enrol_get_enrolled_users": info.functions.some((f) => f.name === "core_enrol_get_enrolled_users"),
				"core_user_get_users": info.functions.some((f) => f.name === "core_user_get_users")
			}
		});
	} catch (err) {
		return json({
			ok: false,
			error: toMoodleErrorMessage(err)
		}, { status: 503 });
	}
};

export { GET };
//# sourceMappingURL=_server.ts-BrJLY90l.js.map
