import { error, redirect } from '@sveltejs/kit';
import { esStaff } from '$lib/server/services/authz.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.usuario) redirect(303, `/auth?redirect=${encodeURIComponent(url.pathname)}`);
  if (!(await esStaff(locals.usuario.usuarioId))) {
    error(403, 'El Laboratorio de apoyos es para el personal autorizado.');
  }
};
