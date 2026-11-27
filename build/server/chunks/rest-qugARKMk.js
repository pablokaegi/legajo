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
//#region src/lib/server/moodle/rest.ts
async function llamarMoodleRest(endpoint, token, funcion, parametros = {}, redirect = "follow", timeoutMs = 1e4) {
	const body = new URLSearchParams({
		wstoken: token,
		wsfunction: funcion,
		moodlewsrestformat: "json"
	});
	for (const [campo, valor] of Object.entries(parametros)) body.set(campo, String(valor));
	let response;
	try {
		response = await fetch(endpoint, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: body.toString(),
			redirect,
			signal: AbortSignal.timeout(timeoutMs)
		});
	} catch (err) {
		if (err instanceof Error && err.name === "TimeoutError") throw new MoodleNetworkError(`La solicitud tardó demasiado (timeout ${timeoutMs / 1e3}s)`);
		throw new MoodleNetworkError(err instanceof Error ? err.message : String(err));
	}
	if (!response.ok) throw new MoodleNetworkError(`HTTP ${response.status} ${response.statusText}`);
	let data;
	try {
		data = await response.json();
	} catch {
		throw new MoodleNetworkError("La respuesta de Moodle no es JSON válido");
	}
	if (data && typeof data === "object" && "exception" in data) throw new MoodleApiError(data);
	return data;
}

export { MoodleApiError as M, llamarMoodleRest as l, toMoodleErrorMessage as t };
//# sourceMappingURL=rest-qugARKMk.js.map
