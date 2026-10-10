import { redirect, error } from '@sveltejs/kit';
import { esGabineteOAdmin } from '../services/authz.js';

// Las actions no corren el layout: cada load y cada action del gabinete pasa por acá.
export async function exigirGabinete(usuario: App.Locals['usuario']): Promise<number> {
  if (!usuario) throw redirect(303, '/auth');
  if (!(await esGabineteOAdmin(usuario.usuarioId)))
    error(403, 'El gabinete psicopedagógico es de acceso reservado.');
  return usuario.usuarioId;
}
