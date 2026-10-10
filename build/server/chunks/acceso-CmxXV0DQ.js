import { b as esGabineteOAdmin } from './authz-BOxGka1D.js';
import { redirect, error } from '@sveltejs/kit';

//#region src/lib/server/gabinete/acceso.ts
async function exigirGabinete(usuario) {
	if (!usuario) throw redirect(303, "/auth");
	if (!await esGabineteOAdmin(usuario.usuarioId)) error(403, "El gabinete psicopedagógico es de acceso reservado.");
	return usuario.usuarioId;
}

export { exigirGabinete as e };
//# sourceMappingURL=acceso-CmxXV0DQ.js.map
