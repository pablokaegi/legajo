import { b as esGabineteOAdmin } from './authz-DQJuia-E.js';
import { redirect, error } from '@sveltejs/kit';

// src/lib/server/gabinete/acceso.ts
async function exigirGabinete(usuario) {
	if (!usuario) throw redirect(303, "/auth");
	if (!await esGabineteOAdmin(usuario.usuarioId)) error(403, "El gabinete psicopedagógico es de acceso reservado.");
	return usuario.usuarioId;
}

export { exigirGabinete as e };
//# sourceMappingURL=acceso-B66Nug0v.js.map
