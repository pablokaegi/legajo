import { p as private_env } from './shared-server-asDUS7ug.js';
import { d as db, e as cacheCursos, f as syncLogs } from './db-CLN6I8p_.js';
import { t as toMoodleErrorMessage, l as llamarMoodleRest } from './rest-qugARKMk.js';
import { gte } from 'drizzle-orm';

//#region src/lib/server/moodle/grade-items.ts
function normalizarItemCalificacion(item) {
	const nota = typeof item.graderaw === "number" && Number.isFinite(item.graderaw) ? item.graderaw : null;
	const rango = item.grademax - item.grademin;
	const porcentaje = nota !== null && !item.scaleid && Number.isFinite(rango) && rango > 0 ? (nota - item.grademin) * 100 / rango : null;
	return {
		id: item.id,
		itemname: item.itemname,
		itemtype: item.itemtype,
		itemmodule: item.itemmodule,
		grademin: item.grademin,
		grademax: item.grademax,
		graderaw: nota,
		gradepercent: nota !== null && !item.scaleid && typeof item.gradepercent === "number" && Number.isFinite(item.gradepercent) ? item.gradepercent : porcentaje,
		gradeformatted: item.gradeformatted ?? "",
		feedback: item.feedback ?? null
	};
}
//#endregion
//#region src/lib/server/moodle/adapter-v1.ts
var MoodleAdapterV1 = class {
	endpoint;
	constructor(baseUrl, token, redirect = "follow") {
		this.baseUrl = baseUrl;
		this.token = token;
		this.redirect = redirect;
		this.endpoint = `${baseUrl}/webservice/rest/server.php`;
	}
	call(wsfunction, params = {}) {
		return llamarMoodleRest(this.endpoint, this.token, wsfunction, params, this.redirect);
	}
	async getSiteInfo() {
		return this.call("core_webservice_get_site_info");
	}
	async getCourses() {
		const result = await this.call("core_course_get_courses");
		if (Array.isArray(result)) return result;
		if (result && "courses" in result && Array.isArray(result.courses)) return result.courses;
		return [];
	}
	async getCategories() {
		const result = await this.call("core_course_get_categories");
		return Array.isArray(result) ? result : [];
	}
	async getEnrolledUsers(courseId) {
		return this.call("core_enrol_get_enrolled_users", { courseid: courseId });
	}
	async searchUsers(query) {
		return (await this.call("core_user_get_users", {
			"criteria[0][key]": "fullname",
			"criteria[0][value]": `%${query}%`
		})).users ?? [];
	}
	async getGradeItems(courseId, userId) {
		const entry = (await this.call("gradereport_user_get_grade_items", {
			courseid: courseId,
			userid: userId
		})).usergrades?.find((user) => user.userid === userId);
		if (!entry) return {
			userid: userId,
			userfullname: "",
			gradeitems: []
		};
		return {
			userid: entry.userid,
			userfullname: entry.userfullname,
			gradeitems: entry.gradeitems.map(normalizarItemCalificacion)
		};
	}
};
//#endregion
//#region src/lib/server/moodle/client.ts
function getAdapter() {
	const url = private_env.MOODLE_URL;
	const token = private_env.MOODLE_TOKEN;
	if (!url) throw new Error("[legajo] MOODLE_URL no está configurada");
	if (!token) throw new Error("[legajo] MOODLE_TOKEN no está configurada");
	return new MoodleAdapterV1(url.replace(/\/+$/, ""), token, private_env.LEGAJO_DEMO_ALOJADA === "1" ? "error" : "follow");
}
var _adapter = null;
function getAdapterInstance() {
	if (!_adapter) _adapter = getAdapter();
	return _adapter;
}
var SITE_INFO_TTL_MS = 300 * 1e3;
var _global = globalThis;
function getSiteInfoCache() {
	const cached = _global.__legajoSiteInfoCache;
	if (cached && Date.now() - cached.timestamp < SITE_INFO_TTL_MS) return cached;
	return null;
}
function setSiteInfoCache(data) {
	_global.__legajoSiteInfoCache = {
		data,
		timestamp: Date.now()
	};
}
async function logSync(tipo, status, mensaje, payload) {
	try {
		await db.insert(syncLogs).values({
			tipo,
			status,
			mensaje,
			payloadJson: payload ? JSON.stringify(payload) : null
		});
	} catch {}
}
var moodle = {
	async getSiteInfo() {
		const cached = getSiteInfoCache();
		if (cached) return cached.data;
		try {
			const info = await getAdapterInstance().getSiteInfo();
			setSiteInfoCache(info);
			await logSync("site_info", "ok", `Conectado como ${info.username} en ${info.sitename}`);
			return info;
		} catch (err) {
			await logSync("site_info", "error", toMoodleErrorMessage(err));
			throw err;
		}
	},
	async getCourses() {
		const oneHourAgo = /* @__PURE__ */ new Date(Date.now() - 3600 * 1e3);
		const cached = await db.select().from(cacheCursos).where(gte(cacheCursos.cachedAt, oneHourAgo));
		if (cached.length > 0) return cached.map((c) => JSON.parse(c.dataJson));
		try {
			const courses = await getAdapterInstance().getCourses();
			for (const c of courses) await db.insert(cacheCursos).values({
				moodleId: c.id,
				nombre: c.fullname,
				shortname: c.shortname,
				dataJson: JSON.stringify(c)
			}).onDuplicateKeyUpdate({ set: {
				nombre: c.fullname,
				shortname: c.shortname,
				dataJson: JSON.stringify(c),
				cachedAt: /* @__PURE__ */ new Date()
			} });
			await logSync("get_courses", "ok", `${courses.length} cursos obtenidos`);
			return courses;
		} catch (err) {
			await logSync("get_courses", "error", toMoodleErrorMessage(err));
			throw err;
		}
	},
	async getCategories() {
		try {
			const categorias = await getAdapterInstance().getCategories();
			await logSync("get_categories", "ok", `${categorias.length} categorías obtenidas`);
			return categorias;
		} catch (err) {
			await logSync("get_categories", "error", toMoodleErrorMessage(err));
			throw err;
		}
	},
	async getEnrolledUsers(courseId) {
		try {
			const users = await getAdapterInstance().getEnrolledUsers(courseId);
			await logSync("enrolled_users", "ok", `${users.length} usuarios en curso ${courseId}`);
			return users;
		} catch (err) {
			await logSync("enrolled_users", "error", toMoodleErrorMessage(err), { courseId });
			throw err;
		}
	},
	async searchUsers(query) {
		try {
			return await getAdapterInstance().searchUsers(query);
		} catch (err) {
			await logSync("search_users", "error", toMoodleErrorMessage(err), { query });
			throw err;
		}
	},
	async getGradeItems(courseId, userId) {
		try {
			const grades = await getAdapterInstance().getGradeItems(courseId, userId);
			await logSync("grade_items", "ok", `Notas de usuario ${userId} en curso ${courseId}`);
			return grades;
		} catch (err) {
			await logSync("grade_items", "error", toMoodleErrorMessage(err), {
				courseId,
				userId
			});
			throw err;
		}
	}
};

export { moodle as m };
//# sourceMappingURL=client-Dsrb4zGp.js.map
