import { g as comprobarDemoAlojada } from './db-CLN6I8p_.js';
import { l as llamarMoodleRest, M as MoodleApiError } from './rest-qugARKMk.js';
import { z } from 'zod';

//#region src/lib/server/moodle/aula-rest.ts
var id = z.number().int().positive().safe();
var matriculados = z.array(z.object({
	id,
	fullname: z.string().trim().min(1),
	roles: z.array(z.object({ shortname: z.string() })).optional()
}));
var ErrorServicioMoodleDePrueba = class extends Error {
	constructor(codigo) {
		super("Moodle rechazó la operación. Revisá el servicio y los permisos de prueba.");
		this.codigo = codigo;
	}
};
function servicioMoodleDePrueba(entorno, claveToken) {
	if (entorno.MOODLE_AULA_HABILITADO !== "1") throw new Error("El piloto de Moodle está desactivado.");
	const mensajeUrl = "Configurá MOODLE_AULA_URL con la URL HTTP del Moodle local de pruebas.";
	let url;
	try {
		url = new URL(entorno.MOODLE_AULA_URL ?? "");
	} catch {
		throw new Error(mensajeUrl);
	}
	if (entorno.LEGAJO_DEMO_ALOJADA === "1") comprobarDemoAlojada(entorno);
	else if (url.protocol !== "http:" || ![
		"127.0.0.1",
		"localhost",
		"[::1]"
	].includes(url.hostname) || url.username || url.password || url.search || url.hash) throw new Error(mensajeUrl);
	const endpoint = url.href.replace(/\/+$/, "") + "/webservice/rest/server.php";
	const token = entorno[claveToken]?.trim() ?? "";
	const curso = id.safeParse(Number(entorno.MOODLE_AULA_CURSO_ID));
	if (!token || !curso.success) throw new Error("Faltan el token y el curso del servicio Moodle de prueba.");
	const cursoId = curso.data;
	async function llamar(funcion, parametros, esquema) {
		let respuesta;
		try {
			respuesta = await llamarMoodleRest(endpoint, token, funcion, parametros, "error", claveToken === "MOODLE_AULA_LIBRO_TOKEN" ? 6e4 : 1e4);
		} catch (err) {
			if (err instanceof MoodleApiError) throw new ErrorServicioMoodleDePrueba(err.errorcode);
			throw new Error("No se pudo confirmar la operación con el Moodle de prueba.");
		}
		const resultado = esquema.safeParse(respuesta);
		if (!resultado.success) throw new Error("El Moodle de prueba devolvió una respuesta inesperada.");
		return resultado.data;
	}
	async function listarAlumnos(cursoSolicitado) {
		if (cursoSolicitado !== cursoId) throw new Error("Ese curso no está habilitado para el piloto.");
		return (await llamar("core_enrol_get_enrolled_users", {
			courseid: cursoId,
			"options[0][name]": "onlyactive",
			"options[0][value]": 1,
			"options[1][name]": "userfields",
			"options[1][value]": "id,fullname,roles",
			"options[2][name]": "sortby",
			"options[2][value]": "siteorder"
		}, matriculados)).filter((u) => u.roles?.some((rol) => rol.shortname === "student")).map(({ id, fullname }) => ({
			id,
			nombre: fullname
		}));
	}
	return {
		cursoId,
		llamar,
		listarAlumnos
	};
}

export { ErrorServicioMoodleDePrueba as E, servicioMoodleDePrueba as s };
//# sourceMappingURL=aula-rest-Gaa3l_kU.js.map
