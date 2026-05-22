import { d as db, g as agrupamientoSesiones, h as agrupamientoVotos, j as agrupamientoGrupos } from './db-BEC8cTGI.js';
import { desc, eq, and } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

//#region src/lib/server/services/agrupamientos.ts
async function listarSesiones(filtros = {}) {
	let q = db.select().from(agrupamientoSesiones).orderBy(desc(agrupamientoSesiones.fecha), desc(agrupamientoSesiones.createdAt));
	if (filtros.estado) q = q.where(eq(agrupamientoSesiones.estado, filtros.estado));
	const sesiones = await q;
	const result = [];
	for (const s of sesiones) {
		const votos = await db.select({ id: agrupamientoVotos.id }).from(agrupamientoVotos).where(eq(agrupamientoVotos.sesionId, s.id));
		result.push({
			...s,
			cantidadVotos: votos.length
		});
	}
	return result;
}
async function obtenerSesion(id) {
	const [row] = await db.select().from(agrupamientoSesiones).where(eq(agrupamientoSesiones.id, id)).limit(1);
	return row ?? null;
}
async function obtenerSesionPorToken(token) {
	const [row] = await db.select().from(agrupamientoSesiones).where(eq(agrupamientoSesiones.votoToken, token)).limit(1);
	return row ?? null;
}
async function crearSesion(createdBy, data) {
	const [result] = await db.insert(agrupamientoSesiones).values({
		cursoMoodleId: data.cursoMoodleId,
		cursoNombre: data.cursoNombre,
		titulo: data.titulo,
		fecha: data.fecha,
		estado: "abierta",
		cantidadEvaluar: data.cantidadEvaluar ?? 5,
		notas: data.notas ?? null,
		createdBy
	});
	return result.insertId;
}
async function editarSesion(id, data) {
	await db.update(agrupamientoSesiones).set({
		...data,
		updatedAt: /* @__PURE__ */ new Date()
	}).where(eq(agrupamientoSesiones.id, id));
}
async function eliminarSesion(id) {
	await db.delete(agrupamientoSesiones).where(eq(agrupamientoSesiones.id, id));
}
/** Genera (o regenera) el token público para votar desde el celular. */
async function generarTokenVoto(id) {
	const token = randomUUID();
	await editarSesion(id, { votoToken: token });
	return token;
}
async function quitarTokenVoto(id) {
	await editarSesion(id, { votoToken: null });
}
function parseCalificaciones(raw) {
	try {
		const arr = JSON.parse(raw);
		if (!Array.isArray(arr)) return [];
		return arr.map((c) => ({
			id: Number(c.id),
			nombre: String(c.nombre ?? ""),
			puntaje: Number(c.puntaje)
		})).filter((c) => c.id > 0 && c.puntaje >= 1 && c.puntaje <= 5);
	} catch {
		return [];
	}
}
async function listarVotos(sesionId) {
	return (await db.select().from(agrupamientoVotos).where(eq(agrupamientoVotos.sesionId, sesionId)).orderBy(agrupamientoVotos.votanteNombre)).map((r) => ({
		id: r.id,
		votanteMoodleId: r.votanteMoodleId,
		votanteNombre: r.votanteNombre,
		calificaciones: parseCalificaciones(r.calificaciones),
		bloqueadoMoodleId: r.bloqueadoMoodleId,
		bloqueadoNombre: r.bloqueadoNombre
	}));
}
/** Devuelve el id del votante de cada voto ya emitido en la sesión. */
async function idsQueVotaron(sesionId) {
	const rows = await db.select({ votanteMoodleId: agrupamientoVotos.votanteMoodleId }).from(agrupamientoVotos).where(eq(agrupamientoVotos.sesionId, sesionId));
	return new Set(rows.map((r) => r.votanteMoodleId));
}
/** Registra un voto nuevo. Lanza 'ya_voto' si el alumno ya votó. */
async function registrarVoto(sesionId, voto) {
	const [existente] = await db.select({ id: agrupamientoVotos.id }).from(agrupamientoVotos).where(and(eq(agrupamientoVotos.sesionId, sesionId), eq(agrupamientoVotos.votanteMoodleId, voto.votanteMoodleId))).limit(1);
	if (existente) throw new Error("ya_voto");
	await db.insert(agrupamientoVotos).values({
		sesionId,
		votanteMoodleId: voto.votanteMoodleId,
		votanteNombre: voto.votanteNombre,
		calificaciones: JSON.stringify(voto.calificaciones),
		bloqueadoMoodleId: voto.bloqueadoMoodleId ?? null,
		bloqueadoNombre: voto.bloqueadoNombre ?? null
	});
}
async function eliminarVoto(votoId) {
	await db.delete(agrupamientoVotos).where(eq(agrupamientoVotos.id, votoId));
}
/**
* Procesa y guarda un voto desde el FormData del kiosko. Lógica compartida
* entre la votación interna y el link público con token.
*/
async function procesarVotoDesdeForm(sesionId, fd) {
	const votanteMoodleId = parseInt(String(fd.get("votanteMoodleId") ?? ""), 10);
	const votanteNombre = String(fd.get("votanteNombre") ?? "").trim();
	if (!votanteMoodleId || !votanteNombre) return { error: "Alumno inválido." };
	let calificaciones = [];
	try {
		const arr = JSON.parse(String(fd.get("calificaciones") ?? "[]"));
		if (Array.isArray(arr)) calificaciones = arr.map((c) => ({
			id: Number(c.id),
			nombre: String(c.nombre ?? ""),
			puntaje: Number(c.puntaje)
		})).filter((c) => c.id > 0 && c.puntaje >= 1 && c.puntaje <= 5);
	} catch {
		return { error: "Datos de votación inválidos." };
	}
	if (calificaciones.length === 0) return { error: "Tenés que calificar a tus compañeros." };
	if (calificaciones.every((c) => c.puntaje === 1)) return { error: "No podés calificar a todos con la puntuación mínima." };
	const bloqRaw = String(fd.get("bloqueadoMoodleId") ?? "");
	const bloqueadoMoodleId = bloqRaw ? parseInt(bloqRaw, 10) : null;
	const valido = bloqueadoMoodleId != null && bloqueadoMoodleId > 0;
	const bloqueadoNombre = String(fd.get("bloqueadoNombre") ?? "").trim() || null;
	try {
		await registrarVoto(sesionId, {
			votanteMoodleId,
			votanteNombre,
			calificaciones,
			bloqueadoMoodleId: valido ? bloqueadoMoodleId : null,
			bloqueadoNombre: valido ? bloqueadoNombre : null
		});
	} catch (e) {
		if (e instanceof Error && e.message === "ya_voto") return { error: "Ese alumno ya emitió su votación." };
		return { error: "No se pudo guardar el voto. Intentá de nuevo." };
	}
	return { ok: true };
}
async function eliminarTodosLosVotos(sesionId) {
	await db.delete(agrupamientoVotos).where(eq(agrupamientoVotos.sesionId, sesionId));
}
function prng(seed) {
	let t = seed >>> 0;
	return () => {
		t = t + 1831565813 | 0;
		let r = Math.imul(t ^ t >>> 15, 1 | t);
		r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r;
		return ((r ^ r >>> 14) >>> 0) / 4294967296;
	};
}
function shuffleSeeded(arr, seed) {
	const a = [...arr];
	const rand = prng(seed);
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
/**
* Selecciona de forma determinística los `cantidad` compañeros que un alumno
* debe evaluar. Determinística: si el alumno recarga la página obtiene los
* mismos compañeros.
*/
function asignarCompaneros(sesionId, votanteId, roster, cantidad) {
	const otros = roster.filter((a) => a.id !== votanteId);
	return shuffleSeeded(otros, sesionId * 1e5 + votanteId).slice(0, Math.min(cantidad, otros.length));
}
/** Genera votos aleatorios realistas para los alumnos que aún no votaron. */
async function generarVotosAleatorios(sesionId, roster, cantidad) {
	const yaVotaron = await idsQueVotaron(sesionId);
	let generados = 0;
	for (const alumno of roster) {
		if (yaVotaron.has(alumno.id)) continue;
		const companeros = asignarCompaneros(sesionId, alumno.id, roster, cantidad);
		if (companeros.length === 0) continue;
		const pesos = [
			10,
			20,
			40,
			25,
			5
		];
		const calificaciones = companeros.map((c) => {
			const total = pesos.reduce((a, b) => a + b, 0);
			let r = Math.random() * total;
			let puntaje = 5;
			for (let p = 0; p < 5; p++) {
				if (r < pesos[p]) {
					puntaje = p + 1;
					break;
				}
				r -= pesos[p];
			}
			return {
				id: c.id,
				nombre: c.nombre,
				puntaje
			};
		});
		const bloqueado = Math.random() < .2 ? companeros[Math.floor(Math.random() * companeros.length)] : null;
		try {
			await registrarVoto(sesionId, {
				votanteMoodleId: alumno.id,
				votanteNombre: alumno.nombre,
				calificaciones,
				bloqueadoMoodleId: bloqueado?.id ?? null,
				bloqueadoNombre: bloqueado?.nombre ?? null
			});
			generados++;
		} catch {}
	}
	return generados;
}
async function listarGrupos(sesionId) {
	return (await db.select().from(agrupamientoGrupos).where(eq(agrupamientoGrupos.sesionId, sesionId)).orderBy(desc(agrupamientoGrupos.createdAt))).map((r) => ({
		...r,
		grupos: JSON.parse(r.gruposJson)
	}));
}
async function guardarGrupos(sesionId, nombre, modo, grupos) {
	const [result] = await db.insert(agrupamientoGrupos).values({
		sesionId,
		nombre,
		modo,
		gruposJson: JSON.stringify(grupos)
	});
	return result.insertId;
}
async function eliminarGrupos(id) {
	await db.delete(agrupamientoGrupos).where(eq(agrupamientoGrupos.id, id));
}

export { eliminarTodosLosVotos as a, eliminarVoto as b, crearSesion as c, generarTokenVoto as d, eliminarSesion as e, editarSesion as f, generarVotosAleatorios as g, listarVotos as h, eliminarGrupos as i, guardarGrupos as j, listarGrupos as k, listarSesiones as l, idsQueVotaron as m, asignarCompaneros as n, obtenerSesion as o, procesarVotoDesdeForm as p, quitarTokenVoto as q, obtenerSesionPorToken as r };
//# sourceMappingURL=agrupamientos-MWeOpDHT.js.map
