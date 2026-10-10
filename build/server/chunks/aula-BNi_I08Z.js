import { d as db, a as aulaPlanos } from './db-DnDhVbjt.js';
import { and, eq, desc } from 'drizzle-orm';

//#region src/lib/server/services/aula.ts
function parseBancos(raw) {
	try {
		const arr = JSON.parse(raw);
		if (!Array.isArray(arr)) return [];
		return arr.filter(Array.isArray).map((b) => b.map((s) => {
			const x = s;
			return x && Number.isInteger(Number(x.id)) ? {
				id: Number(x.id),
				nombre: String(x.nombre ?? "")
			} : null;
		}));
	} catch {
		return [];
	}
}
async function listarPlanos(cursoMoodleId) {
	return db.select().from(aulaPlanos).where(eq(aulaPlanos.cursoMoodleId, cursoMoodleId)).orderBy(desc(aulaPlanos.createdAt));
}
async function obtenerPlano(cursoMoodleId, id) {
	const [p] = await db.select().from(aulaPlanos).where(and(eq(aulaPlanos.id, id), eq(aulaPlanos.cursoMoodleId, cursoMoodleId))).limit(1);
	return p ?? null;
}
async function planoVigente(cursoMoodleId) {
	const [p] = await db.select().from(aulaPlanos).where(and(eq(aulaPlanos.cursoMoodleId, cursoMoodleId), eq(aulaPlanos.vigente, true))).orderBy(desc(aulaPlanos.createdAt)).limit(1);
	return p ?? null;
}
/** Guarda un plano nuevo y lo deja como vigente del curso. */
async function guardarPlano(data) {
	await db.update(aulaPlanos).set({ vigente: false }).where(eq(aulaPlanos.cursoMoodleId, data.cursoMoodleId));
	const [res] = await db.insert(aulaPlanos).values({
		cursoMoodleId: data.cursoMoodleId,
		cursoNombre: data.cursoNombre,
		nombre: data.nombre,
		columnas: data.columnas,
		bancosJson: JSON.stringify(data.bancos),
		origen: data.origen,
		sesionId: data.sesionId,
		vigente: true,
		createdBy: data.createdBy
	});
	return Number(res.insertId);
}
async function marcarVigente(cursoMoodleId, id) {
	await db.update(aulaPlanos).set({ vigente: false }).where(eq(aulaPlanos.cursoMoodleId, cursoMoodleId));
	await db.update(aulaPlanos).set({ vigente: true }).where(and(eq(aulaPlanos.id, id), eq(aulaPlanos.cursoMoodleId, cursoMoodleId)));
}
async function eliminarPlano(cursoMoodleId, id) {
	await db.delete(aulaPlanos).where(and(eq(aulaPlanos.id, id), eq(aulaPlanos.cursoMoodleId, cursoMoodleId)));
}
/** Con quién comparte banco un alumno en los planos vigentes (para el legajo/ficha). */
async function companerosDeBanco(alumnoMoodleId) {
	const vigentes = await db.select().from(aulaPlanos).where(eq(aulaPlanos.vigente, true));
	for (const p of vigentes) {
		const bancos = parseBancos(p.bancosJson);
		const i = bancos.findIndex((b) => b.some((s) => s?.id === alumnoMoodleId));
		if (i >= 0) return {
			cursoNombre: p.cursoNombre,
			cursoMoodleId: p.cursoMoodleId,
			banco: i + 1,
			companeros: bancos[i].filter((s) => s != null && s.id !== alumnoMoodleId)
		};
	}
	return null;
}

export { parseBancos as a, companerosDeBanco as c, eliminarPlano as e, guardarPlano as g, listarPlanos as l, marcarVigente as m, obtenerPlano as o, planoVigente as p };
//# sourceMappingURL=aula-BNi_I08Z.js.map
