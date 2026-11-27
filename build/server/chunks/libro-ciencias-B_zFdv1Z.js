import { s as servicioMoodleDePrueba, E as ErrorServicioMoodleDePrueba } from './aula-rest-Gaa3l_kU.js';
import { d as demoInicial } from './apoyos-DDSemfdS.js';
import { z } from 'zod';
import { resolve } from 'node:path';
import { execFile } from 'node:child_process';

//#region src/lib/laboratorio/libro.ts
function texto(maximo, minimo = 1) {
	return z.string().transform((v) => v.replace(/\r\n?/g, "\n").trim()).pipe(z.string().min(minimo).max(maximo).refine((v) => !v.includes("\0")));
}
var paso = z.object({
	id: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/),
	titulo: texto(120),
	consigna: texto(1400),
	audio: texto(1400, 0)
});
var esquemaLibro = z.object({
	titulo: texto(120),
	objetivo: texto(500),
	pasos: z.array(paso).min(1).max(8)
}).refine(({ pasos }) => new Set(pasos.map((p) => p.id)).size === pasos.length);
function actividadCiencias() {
	return esquemaLibro.parse(demoInicial().actividad);
}

//#region src/lib/server/moodle/audio-libro.ts
var maximoPorPista = 5 * 1024 * 1024;
var pistaLarga = "Un audio supera los 5 MiB admitidos por capítulo. Acortá su guion o dividilo en dos pasos.";
function ejecutar(programa, argumentos, entrada, maxBuffer, signal) {
	return new Promise((cumplir, rechazar) => {
		const proceso = execFile(programa, argumentos, {
			encoding: "buffer",
			windowsHide: true,
			maxBuffer,
			signal
		}, (error, stdout) => {
			if (error?.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER") rechazar(new RangeError(pistaLarga));
			else if (error) rechazar(error);
			else cumplir(stdout);
		});
		proceso.stdin?.on("error", rechazar);
		proceso.stdin?.end(entrada, "utf8");
	});
}
async function sintetizarAudios(guiones) {
	if (!guiones.length) return [];
	const signal = AbortSignal.timeout(9e4);
	if (process.platform === "win32") {
		const audios = (await ejecutar("powershell.exe", [
			"-NoProfile",
			"-NonInteractive",
			"-File",
			resolve("scripts/audio-libro.ps1")
		], JSON.stringify(guiones), 55 * 1024 * 1024, signal)).toString("utf8").trim().split(/\r?\n/);
		if (audios.length !== guiones.length || audios.some((wav) => Buffer.from(wav.slice(0, 16), "base64").toString("ascii", 0, 4) !== "RIFF")) throw new Error("El sintetizador devolvió un audio inválido.");
		if (audios.some((wav) => Buffer.byteLength(wav, "base64") > maximoPorPista)) throw new RangeError(pistaLarga);
		return audios;
	}
	const audios = [];
	for (const guion of guiones) {
		const wav = await ejecutar("espeak-ng", [
			"-v",
			"es-419",
			"-b",
			"1",
			"--stdin",
			"--stdout"
		], guion, maximoPorPista, signal);
		if (wav.length <= 44 || wav.length % 2 !== 0 || wav.toString("ascii", 0, 4) !== "RIFF" || wav.toString("ascii", 8, 16) !== "WAVEfmt " || wav.readUInt32LE(16) !== 16 || wav.readUInt16LE(20) !== 1 || wav.readUInt16LE(22) !== 1 || wav.readUInt16LE(34) !== 16 || wav.toString("ascii", 36, 40) !== "data") throw new Error("eSpeak NG devolvió un WAV inesperado.");
		wav.writeUInt32LE(wav.length - 8, 4);
		wav.writeUInt32LE(wav.length - 44, 40);
		audios.push(wav.toString("base64"));
	}
	return audios;
}
//#endregion
//#region src/lib/server/moodle/libro-ciencias.ts
var entero = z.number().int().nonnegative().safe();
var positivo = entero.min(1);
var libroRecibido = z.object({
	cmid: entero,
	bookid: entero,
	revision: entero,
	titulo: z.string(),
	objetivo: z.string(),
	pasos: z.array(z.object({
		id: z.string(),
		titulo: z.string(),
		consigna: z.string(),
		audio: z.string(),
		chapterid: positivo
	}))
});
var recibo = z.object({
	cmid: positivo,
	bookid: positivo,
	revision: positivo,
	chapters: z.array(z.object({
		id: z.string(),
		chapterid: positivo
	})),
	changed: z.boolean()
});
var ErrorLibro = class extends Error {
	constructor(status, mensaje) {
		super(mensaje);
		this.status = status;
	}
};
async function generarAudios(guiones) {
	try {
		return await sintetizarAudios(guiones);
	} catch (err) {
		if (err instanceof RangeError) throw new ErrorLibro(400, err.message);
		throw new ErrorLibro(503, "No se pudo generar la narración. Revisá la voz en español del equipo y volvé a publicar.");
	}
}
function libroCiencias(entorno) {
	const { cursoId, llamar } = servicioMoodleDePrueba(entorno, "MOODLE_AULA_LIBRO_TOKEN");
	const urlLibro = (cmid) => new URL("mod/book/view.php?id=" + cmid, entorno.MOODLE_AULA_URL.replace(/\/?$/, "/")).href;
	async function leer() {
		const datos = await llamar("local_legajolibro_leer", { courseid: cursoId }, libroRecibido).catch((err) => {
			if (err instanceof ErrorServicioMoodleDePrueba && err.codigo === "drift") throw new ErrorLibro(409, "El Libro fue modificado directamente en Moodle. Revisá con administración esos cambios antes de publicar desde Legajo.");
			throw err;
		});
		if (datos.revision === 0 && !datos.bookid && !datos.cmid && !datos.pasos.length) return {
			revision: 0,
			actividad: null,
			url: null,
			capitulos: []
		};
		if (!datos.revision || !datos.bookid || !datos.cmid) throw new Error("Libro inconsistente");
		const url = urlLibro(datos.cmid);
		const capitulos = datos.pasos.map((paso) => ({
			id: paso.id,
			titulo: paso.titulo,
			url: url + "&chapterid=" + paso.chapterid,
			audio: Boolean(paso.audio)
		}));
		return {
			revision: datos.revision,
			actividad: esquemaLibro.parse(datos),
			url,
			capitulos
		};
	}
	async function publicar(actividad, revision) {
		const anterior = await leer();
		const coincide = JSON.stringify(anterior.actividad) === JSON.stringify(actividad);
		if (anterior.revision !== revision && !coincide) throw new ErrorLibro(409, "Otra persona actualizó el Libro. Compará con la versión publicada y recargá el editor antes de guardar.");
		const nuevos = actividad.pasos.filter((paso) => paso.audio && !anterior.actividad?.pasos.some((actual) => actual.id === paso.id && actual.audio === paso.audio));
		const audios = await generarAudios(nuevos.map((p) => p.audio));
		const archivos = new Map(nuevos.map(({ id }, i) => [id, audios[i]]));
		const parametros = {
			courseid: cursoId,
			revision: anterior.revision + 1,
			titulo: actividad.titulo,
			objetivo: actividad.objetivo
		};
		actividad.pasos.forEach((paso, i) => {
			for (const [clave, valor] of Object.entries(paso)) parametros[`pasos[${i}][${clave}]`] = valor;
			parametros[`pasos[${i}][archivo]`] = archivos.get(paso.id) ?? "";
		});
		const cuerpo = new URLSearchParams();
		for (const [campo, valor] of Object.entries(parametros)) cuerpo.set(campo, String(valor));
		if (cuerpo.toString().length + 1024 > 64 * 1024 * 1024) throw new ErrorLibro(400, "Los audios nuevos juntos superan los 64 MB por envío de este Moodle. Publicá primero el texto y agregá los guiones en tandas.");
		try {
			const resultado = await llamar("local_legajolibro_publicar", parametros, recibo);
			if (resultado.chapters.length !== actividad.pasos.length || !resultado.chapters.every((c, indice) => c.id === actividad.pasos[indice].id)) throw new Error("Capítulos sin confirmar");
			return {
				revision: resultado.revision,
				url: urlLibro(resultado.cmid),
				cmid: resultado.cmid,
				cambio: resultado.changed
			};
		} catch (err) {
			if (err instanceof ErrorServicioMoodleDePrueba && err.codigo === "drift") throw new ErrorLibro(409, "El Libro cambió directamente en Moodle. Revisá los capítulos con administración antes de volver a publicar.");
			const actual = await leer();
			if (actual.actividad && actual.url && JSON.stringify(actual.actividad) === JSON.stringify(actividad)) return {
				revision: actual.revision,
				url: actual.url,
				cmid: Number(new URL(actual.url).searchParams.get("id")),
				cambio: false
			};
			if (actual.revision !== anterior.revision) throw new ErrorLibro(409, "El Libro cambió mientras publicabas. Recargá para revisar la versión actual.");
			throw new ErrorLibro(503, "Moodle no confirmó la publicación. Revisá el acceso del servicio y volvé a intentar.");
		}
	}
	return {
		leer,
		publicar
	};
}

export { ErrorLibro as E, actividadCiencias as a, esquemaLibro as e, libroCiencias as l };
//# sourceMappingURL=libro-ciencias-B_zFdv1Z.js.map
