import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');
  // El estado se carga via fetch del cliente para mostrar loading state
  return {};
};
