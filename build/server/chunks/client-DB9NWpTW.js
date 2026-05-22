import { p as private_env } from './shared-server-asDUS7ug.js';
import { d as db, c as cacheCursos, b as syncLogs } from './db-BwfbdrtT.js';
import { gte } from 'drizzle-orm';

//#region src/lib/server/moodle/errors.ts
var ERROR_MESSAGES = {
	invalidtoken: "El token de Moodle no es válido. Verificá la configuración en .env.",
	invaliduser: "El usuario asociado al token no existe o está inactivo en Moodle.",
	accessdenied: "Sin permisos para esta operación. Habilitá la función en \"Legajo API\" > Moodle.",
	notloggedin: "No autenticado en Moodle. El token puede haber expirado.",
	servicerequireslogin: "El servicio de Moodle requiere autenticación válida.",
	nopermissions: "El token no tiene permisos suficientes para este recurso.",
	invalidparameter: "Parámetro inválido enviado a Moodle.",
	missingparam: "Falta un parámetro requerido.",
	servicenotavailable: "El web service de Moodle no está disponible o no está habilitado.",
	invalidfunction: "Función no habilitada en el servicio \"Legajo API\". Agregala desde la administración de Moodle.",
	codingerror: "Error interno de Moodle."
};
var MoodleApiError = class extends Error {
	errorcode;
	moodleMessage;
	constructor(response) {
		const friendly = ERROR_MESSAGES[response.errorcode] ?? response.message;
		super(friendly);
		this.name = "MoodleApiError";
		this.errorcode = response.errorcode;
		this.moodleMessage = response.message;
	}
};
var MoodleNetworkError = class extends Error {
	constructor(detail) {
		super(`No se pudo conectar con Moodle: ${detail}`);
		this.name = "MoodleNetworkError";
	}
};
function toMoodleErrorMessage(err) {
	if (err instanceof MoodleApiError) return err.message;
	if (err instanceof MoodleNetworkError) return err.message;
	if (err instanceof Error) return `Error inesperado: ${err.message}`;
	return "Error desconocido al comunicarse con Moodle";
}
//#endregion
//#region src/lib/server/moodle/adapter-v1.ts
var MoodleAdapterV1 = class {
	endpoint;
	constructor(baseUrl, token) {
		this.baseUrl = baseUrl;
		this.token = token;
		this.endpoint = `${baseUrl}/webservice/rest/server.php`;
	}
	async call(wsfunction, params = {}) {
		const body = new URLSearchParams({
			wstoken: this.token,
			wsfunction,
			moodlewsrestformat: "json"
		});
		for (const [key, value] of Object.entries(params)) body.set(key, String(value));
		let res;
		try {
			res = await fetch(this.endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: body.toString(),
				signal: AbortSignal.timeout(1e4)
			});
		} catch (err) {
			if (err instanceof Error && err.name === "TimeoutError") throw new MoodleNetworkError("La solicitud tardó demasiado (timeout 10s)");
			throw new MoodleNetworkError(err instanceof Error ? err.message : String(err));
		}
		if (!res.ok) throw new MoodleNetworkError(`HTTP ${res.status} ${res.statusText}`);
		let data;
		try {
			data = await res.json();
		} catch {
			throw new MoodleNetworkError("La respuesta de Moodle no es JSON válido");
		}
		if (data && typeof data === "object" && "exception" in data) throw new MoodleApiError(data);
		return data;
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
		})).usergrades?.[0];
		if (!entry) return {
			userid: userId,
			userfullname: "",
			gradeitems: []
		};
		return {
			userid: entry.userid,
			userfullname: entry.userfullname,
			gradeitems: entry.gradeitems.map((item) => ({
				id: item.id,
				itemname: item.itemname,
				itemtype: item.itemtype,
				itemmodule: item.itemmodule,
				grademin: item.grademin,
				grademax: item.grademax,
				graderaw: item.graderaw ?? null,
				gradepercent: item.gradepercent ?? null,
				gradeformatted: item.gradeformatted,
				feedback: item.feedback ?? null
			}))
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
	return new MoodleAdapterV1(url, token);
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

export { moodle as m, toMoodleErrorMessage as t };
//# sourceMappingURL=client-DB9NWpTW.js.map
