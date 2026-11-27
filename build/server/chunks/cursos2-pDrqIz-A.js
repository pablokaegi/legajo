import { m as moodle } from './client-Dsrb4zGp.js';

//#region src/lib/server/services/cursos.ts
async function listarCursos() {
	return (await moodle.getCourses()).filter((c) => c.id !== 1 && c.visible !== 0);
}
var normalizar = (s) => (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
var esPreceptoria = (s) => normalizar(s).includes("precep");
/**
* Cursos de Preceptoría: los que están en una categoría de Moodle cuyo nombre
* contiene "Preceptoría" (incluye subcategorías) o cuyo nombre de curso la
* menciona. Si no encuentra ninguno, devuelve todos (degradación segura).
*/
async function listarCursosPreceptoria() {
	const cursos = await listarCursos();
	let categorias = [];
	try {
		categorias = await moodle.getCategories();
	} catch {
		categorias = [];
	}
	const idsPreceptoria = /* @__PURE__ */ new Set();
	for (const c of categorias) if (esPreceptoria(c.name)) idsPreceptoria.add(c.id);
	let cambio = true;
	while (cambio) {
		cambio = false;
		for (const c of categorias) if (!idsPreceptoria.has(c.id) && idsPreceptoria.has(c.parent)) {
			idsPreceptoria.add(c.id);
			cambio = true;
		}
	}
	const filtrados = cursos.filter((c) => idsPreceptoria.has(c.categoryid) || esPreceptoria(c.fullname) || esPreceptoria(c.shortname) || esPreceptoria(c.displayname) || esPreceptoria(c.categoryname ?? ""));
	return filtrados.length > 0 ? filtrados : cursos;
}
async function listarAlumnosDeCurso(cursoId) {
	return (await moodle.getEnrolledUsers(cursoId)).filter((u) => {
		if (!u.roles || u.roles.length === 0) return true;
		return u.roles.some((r) => r.shortname === "student");
	}).sort((a, b) => a.lastname.localeCompare(b.lastname));
}
/** Resuelve el curso y los nombres de los alumnos desde el padrón, antes de escribir. */
async function verificarAlumnosDelCurso(cursoId, alumnoIds) {
	const ids = [...new Set(alumnoIds)];
	if (!ids.length || ids.some((id) => !Number.isSafeInteger(id) || id <= 0)) return null;
	const curso = (await listarCursos()).find((c) => c.id === cursoId);
	if (!curso) return null;
	const porId = new Map((await listarAlumnosDeCurso(cursoId)).map((a) => [a.id, a]));
	const alumnos = [];
	for (const id of ids) {
		const alumno = porId.get(id);
		if (!alumno) return null;
		alumnos.push({
			alumnoMoodleId: id,
			alumnoNombre: alumno.fullname.trim().slice(0, 200)
		});
	}
	return {
		cursoNombre: (curso.displayname || curso.fullname).trim().slice(0, 200),
		alumnos
	};
}

export { listarCursos as a, listarAlumnosDeCurso as b, listarCursosPreceptoria as l, verificarAlumnosDelCurso as v };
//# sourceMappingURL=cursos2-pDrqIz-A.js.map
