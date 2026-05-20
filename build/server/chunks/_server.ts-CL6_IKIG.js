import { m as moodle, t as toMoodleErrorMessage } from './client-B0ypzjEJ.js';
import { json } from '@sveltejs/kit';
import './shared-server-9-2j12mp.js';
import './db-C42nfPYx.js';
import './chunk-BBx_TEkp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';

//#region src/routes/api/moodle/status/+server.ts
var GET = async ({ locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
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
//# sourceMappingURL=_server.ts-CL6_IKIG.js.map
