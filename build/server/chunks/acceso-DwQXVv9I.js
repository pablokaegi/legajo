import { e as esStaff } from './authz-C5Ea-Q2l.js';
import { o as obtenerSesion, p as puedeVerSesion, a as puedeGestionarSesion } from './agrupamientos-5uMIuUFA.js';
import { redirect, error } from '@sveltejs/kit';

//#region src/lib/server/agrupamientos/acceso.ts
async function exigirStaff(usuario) {
	if (!usuario) throw redirect(303, "/auth");
	if (!await esStaff(usuario.usuarioId)) error(403, "Agrupamientos es una herramienta del equipo docente.");
	return usuario.usuarioId;
}
/**
* Carga la sesión del parámetro de ruta y verifica el permiso pedido:
* - 'ver': quien la creó, o preceptoría/dirección/admin.
* - 'gestionar': quien la creó, o dirección/admin.
*/
async function exigirSesion(usuario, idParam, nivel) {
	const usuarioId = await exigirStaff(usuario);
	const id = Number(idParam);
	if (!Number.isInteger(id) || id <= 0) error(400, "ID inválido");
	const sesion = await obtenerSesion(id);
	if (!sesion) error(404, "Sesión no encontrada");
	if (!(nivel === "ver" ? await puedeVerSesion(usuarioId, sesion) : await puedeGestionarSesion(usuarioId, sesion))) error(403, "No tenés acceso a esta sesión.");
	return {
		sesion,
		usuarioId
	};
}

export { exigirSesion as a, exigirStaff as e };
//# sourceMappingURL=acceso-DwQXVv9I.js.map
