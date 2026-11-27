import { p as private_env } from './shared-server-asDUS7ug.js';
import { g as comprobarDemoAlojada } from './db-CLN6I8p_.js';

//#region src/lib/server/services/aulaPiloto.ts
function aulaPilotoHabilitada() {
	if (private_env.MOODLE_AULA_HABILITADO !== "1" || !private_env.DATABASE_URL) return false;
	try {
		if (private_env.LEGAJO_DEMO_ALOJADA === "1") {
			comprobarDemoAlojada(private_env);
			return true;
		}
		const db = new URL(private_env.DATABASE_URL);
		return db.protocol === "mysql:" && [
			"127.0.0.1",
			"localhost",
			"[::1]"
		].includes(db.hostname) && db.pathname === "/legajo_aula_test";
	} catch {
		return false;
	}
}
function destinoCuestionarioCiencias() {
	if (!aulaPilotoHabilitada() || !private_env.MOODLE_AULA_QUIZ_TOKEN?.trim()) return null;
	const cursoId = Number(private_env.MOODLE_AULA_CURSO_ID);
	const quizId = Number(private_env.MOODLE_AULA_QUIZ_ID);
	if (!Number.isSafeInteger(cursoId) || cursoId <= 0 || !Number.isSafeInteger(quizId) || quizId <= 0) return null;
	return {
		cursoId,
		quizId
	};
}

export { aulaPilotoHabilitada as a, destinoCuestionarioCiencias as d };
//# sourceMappingURL=aulaPiloto-DLB6Zm9h.js.map
