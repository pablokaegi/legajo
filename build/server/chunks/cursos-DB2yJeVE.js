import { m as moodle } from './client-C5rBgvQ9.js';

//#region src/lib/server/services/cursos.ts
async function listarCursos() {
	return (await moodle.getCourses()).filter((c) => c.id !== 1 && c.visible !== 0);
}
async function listarAlumnosDeCurso(cursoId) {
	return (await moodle.getEnrolledUsers(cursoId)).filter((u) => {
		if (!u.roles || u.roles.length === 0) return true;
		return u.roles.some((r) => r.shortname === "student");
	}).sort((a, b) => a.lastname.localeCompare(b.lastname));
}

export { listarAlumnosDeCurso as a, listarCursos as l };
//# sourceMappingURL=cursos-DB2yJeVE.js.map
